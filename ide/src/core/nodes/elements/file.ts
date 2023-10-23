/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NodeTypeName } from 'u3js/src/types/types';
import { Element, StringInput, } from "../../../libs/flow";
import { parseDragParams, MimeType } from "../../drags";
import { ElemScopedType, valueEnsure, valueOf } from "./utils";

export const createFileInput = (mime: MimeType | undefined, scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) => {
  const value: string = valueOf(scoped, field) ?? '';
  const input = new StringInput(value);

  input.setReadOnly(true);

  const inputDom = input.dom.querySelector('input') as HTMLInputElement;

  inputDom.ondrop = (e: DragEvent) => {
    const data = parseDragParams(e);
    if (!data || data.type !== 'dragFile') {
      return;
    }
    if (mime && mime !== data.mime) {
      return;
    }
    if (data.path === input.getValue()) {
      return;
    }

    valueEnsure(scoped, field, data.path);
    input.setValue(data.path, false);

    element.dispatchEvent(new Event('changeInput'));
  };

  input.update = () => {
    const value: string = valueOf(scoped, field);
    if (value) input.setValue(value, false);
    else input.setValue('', false);
  };

  element.setInput(1);
  element.setOutput(1);
  element.add(input);

  return element;
}
