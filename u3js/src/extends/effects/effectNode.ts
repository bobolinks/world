/* eslint-disable @typescript-eslint/ban-types */
import { Object3D } from "three";
import { ScriptBlockNode } from "../nodes/block";
import { PinTypeSupported } from "../nodes/script";
import { emptyObject } from "../three/utils";
import { addConstructor, addNodeClass } from "../helper/clslib";

type EffectProps = { in?: Record<string, PinTypeSupported>; out?: Record<string, PinTypeSupported>; };

export class EffectNode<T extends Object3D = Object3D> extends ScriptBlockNode<T> {
  public readonly isEffectNode = true;

  constructor(_inst: string, props: EffectProps, code: string, object3d?: T) {
    super(_inst, object3d, false);

    emptyObject(this.typesExtended.in);
    emptyObject(this.inputs);
    for (const [key, type] of Object.entries(props.in || {})) {
      this.addInput(key, type)
    }
    emptyObject(this.typesExtended.out);
    emptyObject(this.outputs);
    for (const [key, type] of Object.entries(props.out || {})) {
      this.addOutput(key, type)
    }

    if (code) {
      this.code = code;
    }
  }

  serialize(json: any): void {
    super.serialize(json);
    // do not save code and types
    delete json.code;
    delete json.types;
  }
}

addNodeClass('EffectNode', EffectNode, {}, 'ScriptBlockNode');

export function addEffectNode(name: string, title: string, props: EffectProps, code: string) {
  return addConstructor(name, {
    clsName: 'EffectNode',
    func: () => new EffectNode(name, props, code),
    group: `Effects.${title}`,
    icon: 'polygon'
  });
}
