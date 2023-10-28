import type * as THREE from 'three';
import { MessageConnection } from 'vscode-jsonrpc';
import { listen } from 'vscode-ws-jsonrpc';
import ReconnectingWebSocket from 'reconnecting-websocket';
import type { NodeTypeName } from 'u3js/dist/types';
import type { ClsInfo, NodeConstructor } from 'u3js/src/types/plugin';
import type { TU3JS } from 'u3js/src/browser';

declare global {
  interface Window {
    U3JS: TU3JS;
  }
}

const { U3JS } = window;

export type JoyEventType = 'INIT' | 'BUTTON' | 'AXIS';
export type JoyEventButton = 'A' | 'B' | 'X' | 'Y' | 'LEFT-1' | 'RIGHT-1' | 'SELECT' | 'START' | 'MODE';
export type JoyEventAxis = 'JOY-X-L' | 'JOY-Y-L' | 'LEFT-2' | 'JOY-X-R' | 'JOY-Y-R' | 'RIGHT-2' | 'AXIS-X' | 'AXIS-Y';
export type JoyEventAction = JoyEventButton | JoyEventAxis;

type JoyEventMap = {
  wsjoy: { type: 'wsjoy', name: JoyEventType, index: number, value: number; action: JoyEventAction },
};

const WSJOY = new class extends U3JS.EventDispatcher<JoyEventMap> {
  private connection: MessageConnection | undefined;
  private onKeyDown: any;

  constructor() {
    super();

    this.onKeyDown = (event: KeyboardEvent) => {
      if (['A', 'B', 'X', 'Y'].includes(event.key.toUpperCase())) {
        const key: JoyEventAction = event.key.toUpperCase() as any;
        this.dispatchEvent({ type: 'wsjoy', name: 'BUTTON', value: 1, index: 0, action: key });
      } else if (event.key === 'ArrowRight') {
        this.dispatchEvent({ type: 'wsjoy', name: 'AXIS', value: 1, index: 0, action: 'AXIS-X' });
      } else if (event.key === 'ArrowLeft') {
        this.dispatchEvent({ type: 'wsjoy', name: 'AXIS', value: -1, index: 0, action: 'AXIS-X' });
      } else if (event.key === 'ArrowUp') {
        this.dispatchEvent({ type: 'wsjoy', name: 'AXIS', value: -1, index: 0, action: 'AXIS-Y' });
      } else if (event.key === 'ArrowDown') {
        this.dispatchEvent({ type: 'wsjoy', name: 'AXIS', value: 1, index: 0, action: 'AXIS-Y' });
      } else if (event.key === 'Enter') {
        this.dispatchEvent({ type: 'wsjoy', name: 'BUTTON', value: 1, index: 0, action: 'START' });
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }
  async start() {
    const webSocket = await this.createWebSocket();

    listen({
      webSocket,
      onConnection: ((connection: MessageConnection) => {
        this.connection = connection;
        connection.listen();
        connection.onNotification((method: string, ...params: any[]): void => {
          const event: any = params[0];
          event.type = event.type.toUpperCase() as JoyEventType;
          event.name = event.name.toUpperCase() as JoyEventAction;
          this.dispatchEvent(event);
        });
        connection.onClose(() => {
          this.connection = undefined;
        });
        console.log('rpc connected!');
      }).bind(this) as any,
    });
  }
  dispose() {
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
      this.onKeyDown = undefined;
    }
  }
  private createUrl(): string {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${location.host}/wsjoy`;
  }
  private async createWebSocket(): Promise<WebSocket> {
    const socketOptions = {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false,
    };
    const webSocket = new ReconnectingWebSocket(this.createUrl(), [], socketOptions);
    webSocket.binaryType = 'arraybuffer';
    return webSocket as WebSocket;
  }
};

class WsJoyEventNode extends U3JS.ScriptBlockNode {
  public readonly isWsJoyEventNode = true;

  public button: JoyEventAction = 'A';

  protected _listenerBorn: any;
  protected _listenerDead: any;
  protected _isActived = false;
  protected _eventForwarding: any;

  constructor(_inst: string, object3d?: THREE.Object3D) {
    super(_inst, object3d);

    this._eventForwarding = (event: any) => {
      this.exec(event);
    };
    this._listenerBorn = () => {
      this._isActived = true;
    };
    this._listenerDead = () => {
      this._isActived = false;
    };

    WSJOY.addEventListener('wsjoy', this._eventForwarding);

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

  get object() {
    return super.object;
  }

  set object(obj: THREE.Object3D) {
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

  async exec(e: Event): Promise<void> {
    const joyEvent = e as any as JoyEventMap['wsjoy'];
    if (!this._isActived) {
      return;
    }
    if (joyEvent.action !== this.button) {
      return;
    }
    return super.exec(e);
  }

  serialize(json: any): void {
    super.serialize(json);
    json.event = this.button;
  }

  deserialize(json: any): void {
    super.deserialize(json);
    this.button = json.event;
  }

  dispose(): void {
    super.dispose();
    if (this._eventForwarding) {
      WSJOY.removeEventListener('wsjoy', this._eventForwarding);
      this._eventForwarding = undefined;
    }
    if (this.object && typeof this.object === 'object') {
      this.object.removeEventListener('onBorn', this._listenerBorn);
      this.object.removeEventListener('onDead', this._listenerDead);
    }
  }
}

export function pluginInstall(
  addThreeClass: (name: string, info: ClsInfo) => void,
  addEffectClass: (name: string, info: ClsInfo) => void,
  addNodeClass: (name: string, cls: typeof Object.constructor, members?: { [key: string]: NodeTypeName }, base?: string, constructors?: Record<string, NodeConstructor>) => void,
  addNodeConstructor: (name: string, constr: NodeConstructor) => void,
) {
  addNodeClass('WsJoyEventNode', WsJoyEventNode, {
    button: '"A" | "B" | "X" | "Y" | "LEFT-1" | "RIGHT-1" | "SELECT" | "START" | "MODE" | "JOY-X-L" | "JOY-Y-L" | "LEFT-2" | "JOY-X-R" | "JOY-Y-R" | "RIGHT-2" | "AXIS-X" | "AXIS-Y"' as any,
  }, 'ScriptBlockNode', {
    eventOnWsJoy: { clsName: 'WsJoyEventNode', func: () => new WsJoyEventNode('eventOnWsJoy'), group: 'Scripts.On WsJoy Event', icon: 'device-gamepad-2' },
  });
}