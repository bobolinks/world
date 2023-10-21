/* eslint-disable @typescript-eslint/no-unused-vars */
import { LabelElement, Element } from "../../../libs/flow";
import type { CPUNodeValueTypeName, NodePin, } from '../../u3js/types/types';
import { consumeChain, createReadonlyTypeInput } from "./elements";
import { ElemScopedType } from "./utils";

export function createElementFieldFromNode(scoped: ElemScopedType, field: string, pin: NodePin<any>): Element {
  const enums: any = {};
  const values: string[] = [];
  const ktypes: Set<string> = new Set();

  for (const type of pin.types) {
    if (type !== null && typeof type === 'object') {
      if (Array.isArray(type)) {
        values.push(...type);
        if (!ktypes.has('Number')) {
          ktypes.add('String');
        }
      } else {
        Object.assign(enums, type);
        const isNum = typeof Object.values(type)[0] === 'number';
        ktypes.add(isNum ? 'Number' : 'String');
      }
    } else if (typeof type === 'string') {
      ktypes.add(type);
    } else if (type !== null) {
      console.error(`type[${type}] unsupported!`);
    }
  }

  const types = [...ktypes];
  const element = ktypes.has('Script') ? (new Element()) : (new LabelElement(field));

  element.name = field;

  const funs = new Set();
  while (types.length) {
    const type: CPUNodeValueTypeName = types.shift() as any;
    let func = consumeChain[type];
    if (!func) {
      console.warn(`type[${type}] unsupported!`);
      func = createReadonlyTypeInput;
    }
    if (funs.has(func)) {
      continue;
    }
    funs.add(func);
    func(scoped, field, element, type, enums, values);
  }

  element.onConnect((source: Element, target: Element) => source.setEnabledInputs(!source.getLinkedObject()));

  return element;
}
