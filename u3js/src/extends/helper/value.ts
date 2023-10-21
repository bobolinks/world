/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Nodes from "three/examples/jsm/nodes/Nodes";
import { Color, Euler, Matrix3, Matrix4, Vector2, Vector3, Vector4 } from "three";
import type { NodeTypeName } from "../../types/types";

type TypeInfo<T> = {
  label?: string;
  fromJson: (jsonData?: any) => T;
  toJson: (v: any) => any;
};

const typesSupported: { [key in NodeTypeName]: TypeInfo<any> } = {
  Boolean: {
    fromJson: (jsonData?: boolean) => new Boolean(jsonData),
    toJson: (v: boolean) => v,
  },
  Number: {
    fromJson: (jsonData?: number) => jsonData ?? 0,
    toJson: (v: number) => v,
  },
  String: {
    fromJson: (jsonData?: string) => jsonData || '',
    toJson: (v: string) => v,
  },
  Url: {
    fromJson: (jsonData?: string) => jsonData || '',
    toJson: (v: string) => v,
  },
  Script: {
    fromJson: (jsonData?: string) => jsonData || '',
    toJson: (v: string) => v,
  },
  Color: {
    fromJson: (jsonData?: any) => new Color().fromArray(jsonData || []),
    toJson: (v: Color) => v.toArray(),
  },
  Vector2: {
    fromJson: (jsonData?: any) => new Vector2().fromArray(jsonData || []),
    toJson: (v: Vector2) => v.toArray(),
  },
  Vector3: {
    fromJson: (jsonData?: any) => new Vector3().fromArray(jsonData || []),
    toJson: (v: Vector3) => v.toArray(),
  },
  Vector4: {
    fromJson: (jsonData?: any) => new Vector4().fromArray(jsonData || []),
    toJson: (v: Vector4) => v.toArray(),
  },
  Euler: {
    fromJson: (jsonData?: any) => new Euler().fromArray(jsonData || []),
    toJson: (v: Euler) => v.toArray(),
  },
  // uniformNode for gpu
  bool: {
    label: 'bool UniformNode',
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(false, 'bool'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  float: {
    label: 'float UniformNode',
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(0.0, 'float'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  color: {
    label: 'color UniformNode',
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Color(), 'color'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  vec2: {
    label: 'vec2 UniformNode',
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector2()); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  vec3: {
    label: 'vec3 UniformNode',
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector3()); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  vec4: {
    label: 'vec4 UniformNode',
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector3()); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  int: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(0, 'int'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  mat3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix3()); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  mat4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix4()); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  code: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  uint: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(0, 'uint'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  void: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  property: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  sampler: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  texture: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  cubeTexture: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  ivec2: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector2(), 'ivec2'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  uvec2: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector2(), 'uvec2'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  bvec2: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector2(), 'bvec2'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  ivec3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector3(), 'ivec3'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  uvec3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector3(), 'uvec3'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  bvec3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector3(), 'bvec3'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  ivec4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector4(), 'ivec4'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  uvec4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector4(), 'uvec4'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  bvec4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Vector4(), 'bvec4'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  imat3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix3(), 'imat3'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  umat3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix3(), 'umat3'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  bmat3: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix3(), 'bmat3'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  imat4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix4(), 'imat4'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  umat4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix4(), 'umat4'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  bmat4: {
    label: undefined,
    fromJson: function (jsonData?: any) { const v = new Nodes.UniformNode(new Matrix4(), 'bmat4'); if (jsonData) v.deserialize(jsonData); return v; },
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  Matrix3: {
    label: undefined,
    fromJson: (jsonData?: any) => new Matrix3,
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  Matrix4: {
    label: undefined,
    fromJson: (jsonData?: any) => new Matrix4,
    toJson: function (v: Nodes.UniformNode) { const json = {}; v.serialize(json); return v; },
  },
  Audio: {
    label: undefined,
    fromJson: (jsonData?: string) => jsonData || '',
    toJson: (v: string) => v,
  },
  Image: {
    label: undefined,
    fromJson: function (jsonData?: any) {
      const img = document.createElement('img');
      if (jsonData?.src) {
        img.src = jsonData.src;
      }
      return img;
    },
    toJson: function (v: HTMLImageElement) {
      return { src: v.src };
    },
  },
  Texture: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  CubeTexture: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  Material: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
  Object3D: {
    label: undefined,
    fromJson: function () {
      throw new Error("Function not implemented.");
    },
    toJson: function () {
      throw new Error("Function not implemented.");
    }
  },
};

export function createVarValueFromType(type: NodeTypeName, jsonData?: any) {
  return typesSupported[type].fromJson(jsonData);
}

export function toJsonByType(type: NodeTypeName, value: any) {
  return typesSupported[type].toJson(value);
}