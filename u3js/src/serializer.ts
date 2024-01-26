import { ImageUtils, Object3D, Texture, } from "three";
import { Graph } from "./extends/graph/graph";
import type { Meta } from "./types/types";

declare module 'three' {
  interface Object3D {
    graph?: Graph;
    fromuuid?: string;
  }
}

// hack
const getDataURL = ImageUtils.getDataURL;
ImageUtils.getDataURL = function (image: HTMLImageElement | HTMLCanvasElement | CanvasImageSource | ImageBitmap | ImageData): string {
  if ((image as any).src) {
    const src: string = (image as any).src;
    if (src.indexOf(location.origin) === 0) {
      return src.replace(location.origin, '');
    }
    return src;
  }
  return getDataURL(image);
}

export type Output = {
  metadata: {
    version: 4.6,
    type: 'Object',
    generator: 'Object3D.toJSON'
  };
  geometries: Array<any>;
  materials: Array<any>;
  textures: Array<any>;
  images: Array<any>;
  shapes: Array<any>;
  skeletons: Array<any>;
  animations: Array<any>;
  nodes: Array<any>;
  listeners: Array<any>;
  object: Record<string, any>;
};

function objectToArray<T>(object: Record<string, T>): Array<T> {
  const ar = Object.values(object);
  ar.forEach(e => delete (e as any).metadata);
  return ar;
}

export function toJSON(obj: Object3D, textures: { [key: string]: Texture }) {
  const meta: Meta = {
    geometries: {},
    materials: {},
    textures: {},
    images: {},
    shapes: {},
    skeletons: {},
    animations: {},
    nodes: {},
    listeners: {},
  };
  const objects: { [key: string]: Object3D } = {};

  for (const texture of Object.values(textures)) {
    meta.textures[texture.uuid] = texture.toJSON(meta);
  }

  obj.traverse((o: Object3D) => {
    objects[o.uuid] = o;
    if (o.graph) {
      const graph = o.graph.serialize(meta);
      delete graph.metadata;
      o.userData.graph = graph;
    } else {
      delete o.userData.graph;
    }
  });

  const json: Output = obj.toJSON(meta);
  json.metadata = {
    version: 4.6,
    type: 'Object',
    generator: 'Object3D.toJSON'
  };

  // fill with extended data
  const traverse = (data: any) => {
    if (!data.uuid) {
      return;
    }
    const obj = objects[data.uuid];
    if (!obj) {
      return;
    }
    if ((obj as any).serialize) {
      (obj as any).serialize(data);
    }
    if (Array.isArray(data.children)) {
      for (const child of data.children) {
        traverse(child);
      }
    }
  };
  traverse(json.object);

  // remove dups
  for (const key of Object.keys(meta.materials)) {
    if (meta.nodes[key]) {
      meta.materials[key] = { uuid: key } as any;
    }
  }
  json.geometries = objectToArray(meta.geometries);
  json.materials = objectToArray(meta.materials);
  json.textures = objectToArray(meta.textures);
  json.images = objectToArray(meta.images);
  json.shapes = objectToArray(meta.shapes);
  json.skeletons = objectToArray(meta.skeletons);
  json.animations = objectToArray(meta.animations);
  json.nodes = objectToArray(meta.nodes);
  json.listeners = objectToArray(meta.listeners);

  return json;
}
