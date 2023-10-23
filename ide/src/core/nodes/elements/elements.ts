/* eslint-disable @typescript-eslint/no-unused-vars */
import { Color, Euler, Vector2, Vector3, Vector4 } from 'three';
import { ColorInput, Element, Input, NumberInput, SelectInput, StringInput, ToggleInput, } from '../../../libs/flow';
import type { CPUNodeValueTypeName, NodeTypeName, } from 'u3js/src/types/types';
import { CodeElement } from './code';
import { ElemScopedType, valueEnsure, valueOf } from './utils';
import { createImageInput } from './image';
import { createObjectInput } from './object';
import { createFileInput } from './file';

type FuncConsume = (scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) => Element;

export const createReadonlyTypeInput = (scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) => {
  const input = new StringInput(`[${type}]`);
  input.setReadOnly(true);
  element.setInput(1);
  element.setOutput(1);
  return element.add(input);
}

export const consumeChain: { [key in CPUNodeValueTypeName]: FuncConsume } = {
  Boolean(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value = valueOf(scoped, field) ?? false;
    const input = new ToggleInput(value).onChange(() => {
      valueEnsure(scoped, field, input.getValue());
      element.dispatchEvent(new Event('changeInput'));
    });

    input.update = () => {
      input.setValue(valueOf(scoped, field) ?? false, false);
    };

    element.setInput(1);
    element.setOutput(1);
    element.add(input);

    return element;
  },
  Number(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value = valueOf(scoped, field) ?? 0;
    let input: Input = null as any;
    let selector: SelectInput = null as any;
    let isEnum = false;

    if (Object.keys(enums).length) {
      isEnum = true;
      const kvs: Array<any> = [];
      Object.entries(enums).forEach(e => kvs.push({ name: e[0], value: e[1] }));
      input = new SelectInput(kvs, value);
      element.add(input);
    } else if (values.length) {
      input = new NumberInput(value);
      element.add(input);
      const kvs: Array<any> = [{ name: '[number]', value: '[number]' }];
      values.forEach(e => kvs.push({ name: e, value: e }));
      selector = new SelectInput(kvs, value);
      selector.onChange(() => {
        if (selector.getValue() === '[number]') {
          input.setReadOnly(false);
        } else {
          input.setReadOnly(true);
          valueEnsure(scoped, field, selector.getValue());
          element.dispatchEvent(new Event('changeInput'));
        }
      });
      if (typeof value === 'string') {
        input.setReadOnly(true);
      } else {
        selector.setValue('[number]', false);
      }
      element.add(selector);
    } else {
      input = new NumberInput(value);
      element.add(input);
    }

    input.onChange(() => {
      valueEnsure(scoped, field, isEnum ? Number.parseInt(input.getValue()) : Number.parseFloat(input.getValue()));
      element.dispatchEvent(new Event('changeInput'));
    });

    input.update = () => {
      const v = valueOf(scoped, field) ?? 0;
      if (typeof v === 'string') {
        input.setReadOnly(true);
        if (selector) {
          selector.setValue(v, false);
        }
      } else if (selector) {
        selector.setValue('[number]', false);
      }
      input.setValue(v, false);
    };

    element.setInput(1);
    element.setOutput(1);

    return element;
  },
  String(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: string = valueOf(scoped, field) ?? '';
    const enumsStr = Object.entries(enums).filter(e => typeof e[1] === 'string');
    let input: Input = null as any;

    if (values.length || enumsStr.length) {
      const kvs: Array<any> = [];
      enumsStr.forEach(e => kvs.push({ name: e[0], value: e[1] }));
      values.forEach(e => kvs.push({ name: e, value: e }));
      input = new SelectInput(kvs, value);
    } else {
      input = new StringInput(value)
    }

    input.onChange(() => {
      valueEnsure(scoped, field, input.getValue());
      element.dispatchEvent(new Event('changeInput'));
    });

    input.update = () => {
      input.setValue(valueOf(scoped, field) ?? '', false);
    };

    element.setInput(1);
    element.setOutput(1);
    element.add(input);

    return element;
  },
  Vector2(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: Vector2 = valueOf(scoped, field) ?? new Vector2();

    const onChanged = () => {
      valueEnsure(scoped, field, value);
      value.set(fieldX.getValue(), fieldY.getValue());
      element.dispatchEvent(new Event('changeInput'));
    };

    const fieldX = new NumberInput(value.x).setTagColor('red').onChange(onChanged);
    const fieldY = new NumberInput(value.y).setTagColor('green').onChange(onChanged);

    fieldX.update = () => {
      fieldX.setValue(value.x, false);
      fieldY.setValue(value.y, false);
    };
    // keep one update entry is enough
    // fieldY.update = update;

    element.setInput(2);
    element.setOutput(2);
    element.add(fieldX).add(fieldY);

    return element;
  },
  Vector3(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: Vector3 = valueOf(scoped, field) ?? new Vector3();

    const onChanged = () => {
      valueEnsure(scoped, field, value);
      value.set(fieldX.getValue(), fieldY.getValue(), fieldZ.getValue());
      element.dispatchEvent(new Event('changeInput'));
    };

    const fieldX = new NumberInput(value.x).setTagColor('red').onChange(onChanged);
    const fieldY = new NumberInput(value.y).setTagColor('green').onChange(onChanged);
    const fieldZ = new NumberInput(value.z).setTagColor('blue').onChange(onChanged);

    fieldX.update = () => {
      fieldX.setValue(value.x, false);
      fieldY.setValue(value.y, false);
      fieldZ.setValue(value.z, false);
    };

    element.setInput(3);
    element.setOutput(3);
    element.add(fieldX).add(fieldY).add(fieldZ);

    return element;
  },
  Vector4(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: Vector4 = valueOf(scoped, field) ?? new Vector4();

    const onChanged = () => {
      valueEnsure(scoped, field, value);
      value.set(fieldX.getValue(), fieldY.getValue(), fieldZ.getValue(), fieldW.getValue());
      element.dispatchEvent(new Event('changeInput'));
    };

    const fieldX = new NumberInput(value.x).setTagColor('red').onChange(onChanged);
    const fieldY = new NumberInput(value.y).setTagColor('green').onChange(onChanged);
    const fieldZ = new NumberInput(value.z).setTagColor('blue').onChange(onChanged);
    const fieldW = new NumberInput(value.w).setTagColor('white').onChange(onChanged);

    fieldX.update = () => {
      fieldX.setValue(value.x, false);
      fieldY.setValue(value.y, false);
      fieldZ.setValue(value.z, false);
      fieldW.setValue(value.w, false);
    };

    element.setInput(4);
    element.setOutput(4);
    element.add(fieldX).add(fieldY).add(fieldZ).add(fieldW);

    return element;
  },
  Color(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: Color = valueOf(scoped, field) ?? new Color();

    if (!value?.getHex) {
      return element;
    }

    const input = new ColorInput(value.getHex()).onChange(() => {
      valueEnsure(scoped, field, value);
      value.setHex(input.getValue());
      element.dispatchEvent(new Event('changeInput'));
    });

    input.update = () => {
      input.setValue(value.getHex(), false);
    };

    element.setInput(3);
    element.setOutput(3);
    element.add(input);

    return element;
  },
  Euler(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: Euler = valueOf(scoped, field) ?? new Euler();

    const onChanged = () => {
      valueEnsure(scoped, field, value);
      value.set(fieldX.getValue(), fieldY.getValue(), fieldZ.getValue());
      element.dispatchEvent(new Event('changeInput'));
    };

    const fieldX = new NumberInput(value.x).setTagColor('red').onChange(onChanged);
    const fieldY = new NumberInput(value.y).setTagColor('green').onChange(onChanged);
    const fieldZ = new NumberInput(value.z).setTagColor('blue').onChange(onChanged);

    fieldX.update = () => {
      fieldX.setValue(value.x, false);
      fieldY.setValue(value.y, false);
      fieldZ.setValue(value.z, false);
    };

    element.setInput(4);
    element.setOutput(4);
    element.add(fieldX).add(fieldY).add(fieldZ);

    return element;
  },
  Script(scoped: ElemScopedType, field: string, element: Element, type: NodeTypeName, enums: { [key: string]: number | string; }, values: Array<string>) {
    const value: string = valueOf(scoped, field) ?? '';

    const input = new CodeElement(value).onChange(() => {
      valueEnsure(scoped, field, input.getValue());
      element.dispatchEvent(new Event('changeInput'));
    });

    input.update = () => {
      input.setValue(valueOf(scoped, field) ?? '', false);
    };

    element.setHeight(370);

    element.setInput(1);
    element.setOutput(1);
    element.add(input);

    return element;
  },
  Matrix3: createReadonlyTypeInput,
  Matrix4: createReadonlyTypeInput,
  Url: createFileInput.bind(undefined, undefined),
  Audio: createFileInput.bind(undefined, 'audio/*'),
  Image: createImageInput,
  Texture: createObjectInput,
  CubeTexture: createObjectInput,
  Material: createObjectInput,
  Object3D: createObjectInput,
};