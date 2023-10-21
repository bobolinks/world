import os from 'os';
import fs from 'fs';
import path from 'path';
import pkg from '../package.json';
import type { Environment, } from 'sfex';
import { parseArgs } from 'sfex/src/args';

export const args = parseArgs({
  port: {
    type: 'number',
    alias: 'p',
    description: '指定服务器端口，默认为8152',
    default: 8152,
  },
  root: {
    alias: 'w',
    description: `指定工作区根目录，默认为'{home}/.${pkg.name}'`,
    default: path.join(os.homedir(), `.${pkg.name}`),
  },
});

if (/^[.]/.test(args.root)) {
  args.root = path.resolve(os.homedir(), args.root);
} else if (args.root[0] === '~') {
  args.root = args.root.replace(/^./, os.homedir());
}

export const env: Environment<typeof args> = {
  debug: process.env.NODE_ENV !== 'production',
  version: pkg.version,
  platform: os.platform as any,
  name: pkg.name,
  paths: {
    root: args.root,
    fs: path.join(args.root, 'files'),
    temp: path.join(args.root, 'temp'),
    logs: path.join(args.root, 'logs'),
  },
  args,
};

if (!fs.existsSync(args.root)) {
  fs.mkdirSync(args.root, { recursive: true });
}

for (const iterator of Object.values(env.paths)) {
  if (!fs.existsSync(iterator)) {
    fs.mkdirSync(iterator);
  }
}

export default env;
