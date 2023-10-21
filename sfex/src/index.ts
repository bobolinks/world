/* eslint-disable @typescript-eslint/no-unused-vars */
import os from 'os';
import path from 'path';
import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import { init, logger } from './logger';
import { ArgsSfex, DispContext, Environment, JsonRpcMessage, JsonRpcResponse, RpcModule } from '../types';

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception: ', err.toString());
  if (err.stack) {
    logger.error(err.stack);
  }
});

/** express */
export const expr = express();

expr.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
expr.use(bodyParser.json({ limit: '100mb' }));
expr.use(bodyParser.raw({ type: 'application/octet-stream', limit: '100mb' }));
expr.use(bodyParser.raw({ type: 'text/plain', limit: '100mb' }));
expr.use(fileUpload());

export function rawRpc() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const value = target[propertyKey];
    value.isRawRpc = true;
  };
}

/** config express */
expr.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.end('OK');
  } else {
    next();
  }
});

function dispMain<T extends ArgsSfex<any>>(app: express.Express, env: Environment<T>, methods: RpcModule) {
  app.post(`/${env.name}/*`, async (req, rsp) => {
    const [, , method, path] = req.path.match(/^\/([^/]+)\/([^/]+)(.*)$/) || [];
    if (!method) {
      return;
    }
    const mth = methods[method];
    if (!mth) {
      rsp.status(404);
      return rsp.end();
    }
    const cxt: DispContext = {
      path,
      req,
      rsp,
    };
    let params: Array<any> = [];
    const body = req.body;
    const json: JsonRpcMessage = body as any;
    const isRawRpc = (mth as any).isRawRpc;
    if (!isRawRpc && json.jsonrpc !== JSONRPC) {
      rsp.status(500);
      return rsp.end();
    }
    if (!isRawRpc) {
      params = json.params;
    } else {
      const hasBody = (typeof body !== 'object' && body !== undefined) || Object.keys(body).length !== 0;
      const hasQuery = Object.keys(req.query).length !== 0;
      const query = hasQuery ? req.query : undefined;
      const files = req.files;
      const hasFiles = files !== undefined;
      const cnt = (hasBody ? 1 : 0) + (hasQuery ? 1 : 0) + (hasFiles ? 1 : 0);
      if (cnt > 1) {
        params.push({
          ...req.query,
          ...body,
          files,
        });
      } else if (cnt === 1) {
        params.push(files || query || body);
      }
    }
    let rs: any;
    let err: any;
    try {
      rs = await (mth as any).call(methods, cxt, ...params);
    } catch (e) {
      err = e;
    }
    if (!isRawRpc) {
      rsp.json({
        jsonrpc: JSONRPC,
        id: json.id,
        result: err ? undefined : rs,
        error: err,
      } as JsonRpcResponse);
    } else {
      if (typeof rs === 'object') {
        rsp.json(rs);
      } else if (!err) {
        if (rs !== undefined) {
          if (rs instanceof Buffer) {
            rsp.write(rs);
          } else {
            rsp.json(rs);
          }
        }
      } else {
        rsp.status(500);
      }
    }
    rsp.end();
  });
}

export async function main<T extends ArgsSfex<any>>(env: Environment<T>, methods: RpcModule, sites?: Record<string, string>) {
  init(env);

  for (const [key, value] of Object.entries(sites || {})) {
    expr.use(`/${env.name}/${key}`, express.static(path.resolve(value)));
  }

  const app = expr.listen(env.args.port, () => {

    dispMain(expr, env, methods);

    const { port } = app.address() as any;

    process.stdout.write(`[port=${port}]\n`);

    app.setTimeout(120000);
    const interfaces: any = [];
    Object.values(os.networkInterfaces()).forEach((e) => {
      if (!e) {
        return;
      }
      e.filter(detail => detail.family === 'IPv4').forEach((detail) => {
        interfaces.push(detail);
      });
    });

    logger.info(`${env.name} started, open link to access : ${interfaces.map((e: { address: any; }) => `http://${e.address}:${port}/`).join(', ')}`);
  });
}

export const JSONRPC = '2.0';