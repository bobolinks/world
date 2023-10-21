import { Object3D } from "three";
import { addNodeClass } from "../helper/clslib";
import { ScriptBlockNode } from "./block";

export class KeyboardNode<T extends Object3D = Object3D> extends ScriptBlockNode<T> {
  public readonly isKeyboardNode = true;

  public event = 'keydown' as 'keydown' | 'keyup';
  public key: string = '';

  protected _listenerKeyDown: any;
  protected _listenerKeyUp: any;
  protected _listenerBorn: any;
  protected _listenerDead: any;
  protected _isActived = false;

  constructor(_inst: string, object3d?: T) {
    super(_inst, object3d);

    this._listenerKeyDown = (event: KeyboardEvent) => {
      this.exec(event);
    };
    this._listenerKeyUp = (event: KeyboardEvent) => {
      this.exec(event);
    };
    this._listenerBorn = () => {
      this._isActived = true;
    };
    this._listenerDead = () => {
      this._isActived = false;
    };

    const keys = ['_listenerKeyDown', '_listenerKeyUp'];

    window.addEventListener('keydown', this._listenerKeyDown);
    window.addEventListener('keyup', this._listenerKeyUp);

    if (this.object && typeof this.object === 'object') {
      this.object.addEventListener('onBorn', this._listenerBorn);
      this.object.addEventListener('onDead', this._listenerDead);
      keys.push('_listener', '_listenerBorn', '_listenerDead');
    }

    for (const key of keys) {
      Object.defineProperty(this, key, {
        writable: false,
      });
    }
  }

  get object() {
    return super.object;
  }

  set object(obj: T) {
    super.object = obj;

    const keys = [];

    if (this.object && typeof this.object === 'object') {
      this.object.addEventListener('onBorn', this._listenerBorn);
      this.object.addEventListener('onDead', this._listenerDead);
      keys.push('_listener', '_listenerBorn', '_listenerDead');
    }

    for (const key of keys) {
      Object.defineProperty(this, key, {
        writable: false,
      });
    }
  }

  async exec(e: KeyboardEvent): Promise<void> {
    if (!this._isActived) {
      return;
    }
    if (e.type !== this.event || e.key !== this.key) {
      return;
    }
    return super.exec(e);
  }

  serialize(json: any): void {
    super.serialize(json);
    json.event = this.event;
    json.key = this.key;
  }

  deserialize(json: any): void {
    super.deserialize(json);
    this.event = json.event;
    this.key = json.key;
  }

  dispose(): void {
    super.dispose();
    window.removeEventListener('keydown', this._listenerKeyDown);
    window.removeEventListener('keyup', this._listenerKeyUp);
    if (this.object && typeof this.object === 'object') {
      this.object.removeEventListener('onBorn', this._listenerBorn);
      this.object.removeEventListener('onDead', this._listenerDead);
    }
  }
}

addNodeClass('KeyboardNode', KeyboardNode, {
  event: '"keydown"|"keyup"' as any,
  key: '"a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"|"i"|"j"|"k"|"l"|"m"|"n"|"o"|"p"|"q"|"r"|"s"|"t"|"u"|"v"|"w"|"x"|"y"|"z"' as any,
}, 'ScriptBlockNode', {
  keyboardEvent: { clsName: 'KeyboardNode', func: () => new KeyboardNode('keyboardEvent'), group: 'Scripts.On Keyboard', icon: 'keyboard' },
});