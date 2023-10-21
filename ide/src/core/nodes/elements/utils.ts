import { Object3D, Texture } from 'three';
import type { ThreeNode } from '../../u3js/types/types';

export type ElemScopedType = ThreeNode | Object3D | Texture;

export function valueOf(scoped: ElemScopedType, field: string) {
  const value = (scoped as any)[field];
  if (value?.isUniformNode) {
    return value.value;
  }
  return value;
}

export function valueEnsure<T>(scoped: ElemScopedType, field: string, value: T) {
  const v = (scoped as any)[field];
  if (v === undefined || v === null) {
    (scoped as any)[field] = value;
    return;
  }
  const t = typeof v;
  if (v.isUniformNode) {
    if (v.value === undefined) {
      v.value = value;
    }
  } else if (['number', 'string', 'boolean'].includes(t)) {
    (scoped as any)[field] = value;
  }
  return value;
}
