import Net, { Request } from "./net";

let id = 0;

export default {
  async request(request: Omit<Request, 'method' | 'data'>, ...params: Array<any>) {
    const body = {
      jsonrpc: '2.0',
      id: id++,
      method: '',
      params,
    };
    const headers = {
      "Content-Type": 'application/json',
      ...request.headers,
    };
    let rs = await Net.request({ ...request, data: JSON.stringify(body), method: 'POST', headers }) as any;
    if (typeof rs === 'string') {
      rs = JSON.parse(rs);
    }
    return rs.result;
  },
  requestSync(request: Omit<Request, 'method' | 'data'>, ...params: Array<any>) {
    const body = {
      jsonrpc: '2.0',
      id: id++,
      method: '',
      params,
    };
    const headers = {
      "Content-Type": 'application/json',
      ...request.headers,
    };
    let rs = Net.requestSync({ ...request, data: JSON.stringify(body), method: 'POST' }) as any;
    if (typeof rs === 'string') {
      rs = JSON.parse(rs);
    }
    return rs.result;
  }
}
