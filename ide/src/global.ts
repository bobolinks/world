import { EventDispatcher, } from "three";
import { Project, ProjectEvent, ProjectEventMap } from "./core/project";
import { World, WorldEvent, WorldEventMap } from "./core/world";
import { Dragable } from "./utils/dragable";
import { GraphEditor, GraphEditorEvent, GraphEditorEventMap } from "./core/nodes/GraphEditor";
import { HistoryManager } from "./core/history";
import type { HistoryEventMap, HistoryEventName, UserEventMap } from "./core/u3js/types/types";

export type GlobalEvent = UserEventMap | GraphEditorEvent | ProjectEvent | WorldEvent | HistoryEventName | 'projectDirty' | 'assetsChanged';
export type GlobalEventMap = GraphEditorEventMap & ProjectEventMap & WorldEventMap & HistoryEventMap & {
  projectDirty: { type: 'projectDirty' };
  assetsChanged: { type: 'assetsChanged' },
};

function keyFormat(s: string) {
  const names = s.replace(/\s/mg, '').split('+');
  const keys = new Set();
  if (names.includes('meta')) keys.add('meta');
  if (names.includes('ctrl')) keys.add('ctrl');
  if (names.includes('alt')) keys.add('alt');
  if (names.includes('shift')) keys.add('shift');
  keys.add(names.pop());
  return [...keys].join('+');
}

export const ChangedEvents: Array<GlobalEvent> = [
  'graphAdded', 'graphModified', 'graphConnected', 'graphDisconnected', 'graphRemoved',
  'objectAdded', 'objectModified', 'objectRemoved',
  'projectSettingsChanged',
];

type KeyListenerCallback = (e: KeyboardEvent) => void;
type KeyListener = {
  cb: KeyListenerCallback;
  group: string;
  own?: any;
};

export type KeyGroup = {
  enabled: boolean;
  keys: Record<string, string>;
};

export const global = new class extends EventDispatcher<GlobalEventMap> {
  // must not be null
  public dragable = null as any as Dragable;
  public readonly history = new HistoryManager();

  private _project = new Project('');
  private _world = null as any as World;
  private _editor = null as any as GraphEditor;

  private _keydownListener: any;
  private _keydownListeners: Record<string, KeyListener> = {};
  private _keyupListener: any;
  private _keyupListeners: Record<string, KeyListener> = {};

  public readonly keyGroups: Record<string, KeyGroup> = {};

  constructor() {
    super();

    this._keydownListener = (e: any) => {
      this.onKeyDown(e);
    };

    this._keyupListener = (e: any) => {
      this.onKeyUp(e);
    };

    this.hookDispatchEvent(this.history);

    window.addEventListener('keydown', this._keydownListener);
    window.addEventListener('keyup', this._keyupListener);
  }

  get project() {
    return this._project;
  }
  set project(value: Project) {
    if (this._project) {
      this.unhookDispatchEvent(this._project);
    }
    this._project = value;
    this.hookDispatchEvent(this._project);
  }

  get world() {
    return this._world;
  }
  set world(value: World) {
    if (this._world) {
      this.unhookDispatchEvent(this._world);
    }
    this._world = value;
    this.hookDispatchEvent(this._world);
  }

  get editor() {
    return this._editor;
  }
  set editor(value: GraphEditor) {
    if (this._editor) {
      this.unhookDispatchEvent(this._editor);
    }
    this._editor = value;
    this.hookDispatchEvent(this._editor);
  }

  private hookDispatchEvent(dispatcher: EventDispatcher<any>) {
    if ((dispatcher as any)._orgDispatchEvent) {
      return;
    }
    (dispatcher as any)._orgDispatchEvent = dispatcher.dispatchEvent;
    const hook = (e: any) => {
      console.log('event forwarding', e);
      (dispatcher as any)._orgDispatchEvent.call(dispatcher, e);
      this.dispatchEvent(e);
    };
    (dispatcher as any).dispatchEvent = hook;
  }

  private unhookDispatchEvent(dispatcher: EventDispatcher<any>) {
    if (!(dispatcher as any)._orgDispatchEvent) {
      return;
    }
    (dispatcher as any).dispatchEvent = (dispatcher as any)._orgDispatchEvent;
    delete (dispatcher as any)._orgDispatchEvent;
  }

  dispatchEvent<T extends Extract<keyof GlobalEventMap, string>>(event: GlobalEventMap[T]): void {
    super.dispatchEvent(event as any);
    if (ChangedEvents.includes(event.type)) {
      super.dispatchEvent({ type: 'projectDirty' });
    }
  }

  dispose() {
    window.removeEventListener('keydown', this._keydownListener);
  }

  addKeyDownListener(key: string, listener: Omit<KeyListener, 'group'> | KeyListenerCallback, groupPath: string) {
    const [group, title] = groupPath.split('.');
    key = keyFormat(key);
    const bound = this._keydownListeners[key];
    if (bound) {
      console.warn(`key[${key}] conflicted!`)
      return false;
    }
    const g = this.keyGroups[group] || (this.keyGroups[group] = { enabled: true, keys: {} });
    g.keys[key] = title;
    if (typeof listener === 'function') {
      listener = {
        cb: listener,
        group,
      } as KeyListener;
    } else {
      (listener as KeyListener).group = group;
    }
    this._keydownListeners[key] = listener as KeyListener;
  }

  removeKeyDownListener(key: string, cb: KeyListenerCallback) {
    key = keyFormat(key);
    const bound = this._keydownListeners[key];
    if (!bound || bound.cb !== cb) {
      return;
    }
    delete this._keydownListeners[key];
  }

  private onKeyDown(event: KeyboardEvent) {
    const keys = [];
    if (event.metaKey) {
      keys.push('meta');
    }
    if (event.ctrlKey) {
      keys.push('ctrl');
    }
    if (event.altKey) {
      keys.push('alt');
    }
    if (event.shiftKey) {
      keys.push('shift');
    }
    if (!keys.includes(event.key.toLocaleLowerCase())) {
      keys.push(event.key);
    }
    const key = keys.join('+');
    const bound = this._keydownListeners[key];
    if (!bound) {
      return;
    }
    const g = this.keyGroups[bound.group];
    if (!g.enabled) {
      return;
    }
    if (bound.own) {
      bound.cb.call(bound.own, event);
    } else {
      bound.cb(event);
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  addKeyUpListener(key: string, listener: Omit<KeyListener, 'group'> | KeyListenerCallback) {
    key = keyFormat(key);
    const bound = this._keyupListeners[key];
    if (bound) {
      console.warn(`key[${key}] conflicted!`)
      return false;
    }
    if (typeof listener === 'function') {
      listener = {
        cb: listener,
      } as KeyListener;
    }
    this._keyupListeners[key] = listener as KeyListener;
  }

  removeKeyUpListener(key: string, cb: KeyListenerCallback) {
    key = keyFormat(key);
    const bound = this._keyupListeners[key];
    if (!bound || bound.cb !== cb) {
      return;
    }
    delete this._keyupListeners[key];
  }

  private onKeyUp(event: KeyboardEvent) {
    const keys = [];
    if (event.metaKey) {
      keys.push('meta');
    }
    if (event.ctrlKey) {
      keys.push('ctrl');
    }
    if (event.altKey) {
      keys.push('alt');
    }
    if (event.shiftKey) {
      keys.push('shift');
    }
    if (!keys.includes(event.key.toLocaleLowerCase())) {
      keys.push(event.key);
    }
    const key = keys.join('+');
    const bound = this._keyupListeners[key];
    if (!bound) {
      return;
    }
    if (bound.own) {
      bound.cb.call(bound.own, event);
    } else {
      bound.cb(event);
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}
