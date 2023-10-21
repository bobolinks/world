/* eslint-disable @typescript-eslint/no-unused-vars */
import type { CPUNodeObjectValueType, NodeTypeName, } from '../../u3js/types/types';
import { Element, StringInput, } from "../../../libs/flow";
import { parseDragParams } from "../../drags";
import { ElemScopedType, valueOf } from "./utils";
import { getProxyRawObject } from '../../u3js/extends/three/utils';

export const createObjectInput = (scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) => {
  const value: Exclude<CPUNodeObjectValueType, HTMLImageElement> = valueOf(scoped, field);
  const input = new StringInput(value?.uuid || 'null');

  input.setReadOnly(true);

  const inputDom = input.dom.querySelector('input') as HTMLInputElement;

  inputDom.ondrop = (e: DragEvent) => {
    const data = parseDragParams(e);
    if (data?.type !== 'dragObject' || !(data.object as any).uuid) {
      return;
    }
    const uuid = (data.object as any).uuid;
    if (uuid === input.getValue()) {
      return;
    } if (data.otype !== type) {
      return;
    }
    (scoped as any)[field] = (data.object as any)[getProxyRawObject] || data.object;
    input.setValue(uuid, false);
    element.dispatchEvent(new Event('changeInput'));
  };

  input.update = () => {
    const value: Exclude<CPUNodeObjectValueType, HTMLImageElement> = valueOf(scoped, field);
    if (value) input.setValue(value.uuid, false);
    else input.setValue('null', false);
  };

  element.setInput(1);
  element.setOutput(1);
  element.add(input);

  return element;
}
