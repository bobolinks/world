import { EventDispatcher, Object3D, } from "three";
import type { Object3DEventName } from "../../types/types";
import { ScriptBlockNode } from './block';
import { addNodeClass } from "../helper/clslib";

export type NodeEventType = Object3DEventName | string;

export class EventListenerNode<T extends Object3D = Object3D> extends ScriptBlockNode<T> {
  public readonly isEventListenerNode = true;

  protected _event: NodeEventType = 'onBorn';
  protected _eventSource: EventDispatcher<any>;
  protected _listener: any;

  constructor(_inst: string, event?: NodeEventType, object3d?: T, eventSource?: EventDispatcher<any>) {
    super(_inst, object3d);

    if (event) {
      this._event = event;
    }

    this._eventSource = eventSource || this.object;
  }

  get object() {
    return super.object;
  }

  set object(obj: T) {
    super.object = obj;
    if (!this._eventSource) {
      this._eventSource = obj;
    }
    this.resetEventlisten(this._event);
  }

  get event() {
    return this._event;
  }

  set event(name: NodeEventType) {
    this.resetEventlisten(name);
    this._event = name;
  }

  serialize(json: any): void {
    super.serialize(json);
    json.event = this.event;
  }

  deserialize(json: any): void {
    super.deserialize(json);
    this.event = json.event;
  }

  protected resetEventlisten(newEvent: NodeEventType) {
    if (this.object === null || typeof this.object !== 'object') {
      return;
    }
    if (this._listener) {
      this._eventSource.removeEventListener(this.event, this._listener);
    }
    this._listener = (e: any) => {
      this.exec(e);
    };
    this._eventSource.addEventListener(newEvent, this._listener);
  }

  dispose() {
    super.dispose();
    if (this._listener && typeof this.object === 'object') {
      this._eventSource.removeEventListener(this.event, this._listener);
    }
  }
}

addNodeClass('EventListenerNode', EventListenerNode, {
  event: 'String',
}, 'ScriptBlockNode', {
  eventOnBorn: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventOnBorn', 'onBorn'), group: 'Scripts.On Born', icon: 'loader' },
  eventOnDead: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventOnDead', 'onDead'), group: 'Scripts.On Dead', icon: 'bell-off' },
  eventOnCollisionEnter: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventOnCollisionEnter', 'onCollisionEnter'), group: 'Scripts.On Collision Enter', icon: 'arrows-shuffle' },
  eventOnCollisionLeave: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventOnCollisionLeave', 'onCollisionLeave'), group: 'Scripts.On Collision Leave', icon: 'arrow-bounce' },
  eventOnDragStart: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventOnDragStart', 'onDragStart'), group: 'Scripts.On Drag Start', icon: 'hand-grab' },
  eventOnDrop: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventOnDrop', 'onDrop'), group: 'Scripts.On Drop', icon: 'hand-grab' },
  eventCustom: { clsName: 'EventListenerNode', func: () => new EventListenerNode('eventCustom', 'onCustomEvent'), group: 'Scripts.On Custom Event', icon: 'calendar-event' },
});