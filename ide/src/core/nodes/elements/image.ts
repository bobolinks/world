/* eslint-disable @typescript-eslint/no-unused-vars */
import { ImageLoader, Texture, } from "three";
import { Element, StringInput, } from "../../../libs/flow";
import { parseDragParams } from "../../drags";
import { ElemScopedType, valueOf } from "./utils";
import type { NodeTypeName } from 'u3js/src/types/types';

export const createImageInput = (scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) => {
  const value: HTMLImageElement = valueOf(scoped, field) ?? document.createElement('img');
  const input = new StringInput(value.src);

  input.setReadOnly(true);

  const inputDom = input.dom.querySelector('input') as HTMLInputElement;

  inputDom.ondrop = async (e: DragEvent) => {
    if (!e.dataTransfer) {
      return;
    }
    let url: any;
    const len = e.dataTransfer.files.length;
    if (len !== 1) {
      const data = parseDragParams(e);
      if (!data || data.type !== 'dragFile' || data.mime !== 'image/*') {
        return;
      }
      url = data.path;
    } else {
      const item: any = e.dataTransfer.files[0];

      const filter = /^(?:image|video)\//;
      if (!filter.test(item.type)) {
        return;
      }
      url = URL.createObjectURL(item);
    }

    e.stopPropagation();
    e.preventDefault();

    const loader = new ImageLoader();
    const image = await loader.loadAsync(url);

    (scoped as any)[field] = image;
    if (scoped instanceof Texture) {
      scoped.needsUpdate = true;
    }
    input.setValue(url, false);
    element.dispatchEvent(new Event('changeInput'));
  };

  input.update = () => {
    const value: HTMLImageElement = valueOf(scoped, field);
    if (value) input.setValue(value.src, false);
    else input.setValue('null', false);
  };

  element.setInput(1);
  element.setOutput(1);
  element.add(input);

  return element;
}
