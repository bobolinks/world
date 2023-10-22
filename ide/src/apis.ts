import Net from './utils/net';
import Rpc from './utils/rpc';

export type EnvSceneInfo = { name: string; title: string; cover: string; format: string; };

export default {
  async projects(): Promise<Array<string>> {
    const rs = await Rpc.request({
      url: '/fs/ls',
    });
    return Object.entries(rs).filter((e) => (e[1] as any).isd).map(([k]) => k);
  },
  async createProject(name: string): Promise<any> {
    await Rpc.request({
      url: `/fs/mkdir/${name}`,
    }, ['images', 'sounds', 'fonts', 'models', 'plugins']);
  },
  async renameProject(old: string, name: string) {
    await Rpc.request({
      url: `/fs/rename/${old}`,
    }, name);
  },
  async write(file: string, data: string | object | ArrayBuffer) {
    if (!(data instanceof ArrayBuffer) && typeof data === 'object') {
      data = JSON.stringify(data, null, 2);
    }
    await Net.request({
      url: file,
      data,
      method: 'POST',
    });
  },
  async environments(): Promise<Array<EnvSceneInfo>> {
    const rs = await Rpc.request({
      url: '/fs/ls/shared/environments',
    });
    const names = Object.entries(rs).filter((e) => (e[1] as any).isd).map(([k]) => k);
    return Promise.all(names.map(async (name: string) => {
      let json: any = await Net.request({ url: `/fs/file/shared/environments/${name}/index.json` });
      if (typeof json === 'string') {
        json = JSON.parse(json);
      }
      return {
        name,
        ...json,
        cover: `/fs/file/shared/environments/${name}/${json.cover}`,
      } as EnvSceneInfo;
    }));
  },
  async getMediaFiles(project: string): Promise<Array<{ url: string; size: number }>> {
    const paths = ['shared/images', 'shared/sounds'];
    if (project !== 'shared') {
      paths.push(`${project}/images`, `${project}/sounds`);
    }
    const set = await Promise.all(paths.map(async (e) => {
      const rs = await Rpc.request({ url: `/fs/ls/${e}` });
      return rs ? Object.entries(rs).filter((e) => !(e[1] as any).isd).map(([k, i]) => ({ url: `/fs/file/${e}/${k}`, size: (i as any).size })) : [];
    }));
    return set.flat();
  },
  async getModelFiles(project: string): Promise<Array<{ url: string; size: number }>> {
    const paths = ['shared/models'];
    if (project !== 'shared') {
      paths.push(`${project}/models`);
    }
    const set = await Promise.all(paths.map(async (e) => {
      const rs = await Rpc.request({ url: `/fs/ls/${e}` });
      return rs ? Object.entries(rs).filter((e) => !(e[1] as any).isd).map(([k, i]) => ({ url: `/fs/file/${e}/${k}`, size: (i as any).size })) : [];
    }));
    return set.flat();
  },
  async getFonts(project: string): Promise<Array<string>> {
    const paths = ['shared/fonts'];
    if (project !== 'shared') {
      paths.push(`${project}/fonts`);
    }
    const set = await Promise.all(paths.map(async (e) => {
      const rs = await Rpc.request({ url: `/fs/ls/${e}` });
      return rs ? Object.entries(rs).filter((e) => !(e[1] as any).isd).map(([k]) => `/fs/file/${e}/${k}`) : [];
    }));
    return set.flat();
  },
  async getPlugins(project: string): Promise<Array<{ url: string; size: number }>> {
    const paths = ['shared/plugins'];
    if (project !== 'shared') {
      paths.push(`${project}/plugins`);
    }
    const set = await Promise.all(paths.map(async (e) => {
      const rs = await Rpc.request({ url: `/fs/ls/${e}` });
      return rs ? Object.entries(rs).filter((e) => !(e[1] as any).isd && /\.js|\.mjs$/.test(e[0])).map(([k, i]) => ({ url: `/fs/file/${e}/${k}`, size: (i as any).size })) : [];
    }));
    return set.flat();
  },
  async uploadFile(file: File): Promise<{ url: string; size: number }> {
    console.log(file);
    return { url: '', size: 0 };
  }
}