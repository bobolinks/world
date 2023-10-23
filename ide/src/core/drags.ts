import { EventDispatcher, } from "three";
import type { CPUNodeObjectValueType, CPUNodeObjectValueTypeName } from "u3js/src/types/types";

type UUID = string;

declare module 'three' {
  interface EventDispatcher {
    uuid?: UUID;
  }
}

export type MimeType = 'image/*' | 'audio/*' | 'font/*' | 'model/*' | 'video/*' | 'application/json' | 'application/javascript';
export type DragEventType = 'dragNodeClass' | 'dragObjectClass' | 'dragObject' | 'dragFile';
export type DragEventMap = {
  dragNodeClass: { type: 'dragNodeClass'; soure: EventDispatcher | null; name: string; };
  dragObjectClass: { type: 'dragObjectClass'; soure: EventDispatcher | null; name: string; };
  dragObject: { type: 'dragObject'; soure: EventDispatcher | null; object: CPUNodeObjectValueType; otype: CPUNodeObjectValueTypeName };
  dragFile: { type: 'dragFile'; soure: EventDispatcher | null; path: string, mime: MimeType };
};
export type DragData = DragEventMap[DragEventType];

const objectsCached: Record<string, EventDispatcher | CPUNodeObjectValueType> = {};
function objectPush(obj: EventDispatcher | CPUNodeObjectValueType | null): string | undefined {
  if (!obj) {
    return;
  }
  const key = (obj as any).uuid || (obj as any).src;
  if (key) {
    objectsCached[key] = obj;
  }
  return key;
}
function objectPop(key?: string): EventDispatcher | CPUNodeObjectValueType | null {
  if (!key) {
    return null;
  }
  const obj = objectsCached[key];
  if (obj) {
    delete objectsCached[key];
  }
  return obj || null;
}

export function fillDragParams<T extends DragEventType>(ev: DragEvent, data: DragEventMap[T]) {
  if (!ev.dataTransfer) {
    throw new Error('no dataTransfer');
  }
  objectPush(data.soure);
  ev.dataTransfer.setData('type', data.type);
  ev.dataTransfer.setData('soure', data.soure?.uuid || '');
  if (data.type === 'dragNodeClass') {
    ev.dataTransfer.setData('name', data.name);
  } else if (data.type === 'dragObjectClass') {
    ev.dataTransfer.setData('name', data.name);
  } else if (data.type === 'dragObject') {
    ev.dataTransfer.setData('object', objectPush(data.object) || '');
    ev.dataTransfer.setData('otype', data.otype);
  } else if (data.type === 'dragFile') {
    ev.dataTransfer.setData('src', data.path);
    ev.dataTransfer.setData('mime', data.mime);
  }
}

export function parseDragParams(ev: DragEvent): DragData | undefined {
  if (!ev.dataTransfer) {
    return undefined;
  }
  const type: DragEventType = ev.dataTransfer.getData('type') as any;
  if (!type) {
    return undefined;
  }
  switch (type) {
    case 'dragNodeClass': {
      return {
        type: 'dragNodeClass',
        soure: objectPop(ev.dataTransfer.getData('source')) as any,
        name: ev.dataTransfer.getData('name') as any,
      };
    }
    case 'dragObjectClass': {
      return {
        type: 'dragObjectClass',
        soure: objectPop(ev.dataTransfer.getData('source')) as any,
        name: ev.dataTransfer.getData('name') as any,
      };
    }
    case 'dragObject': {
      return {
        type: 'dragObject',
        soure: objectPop(ev.dataTransfer.getData('source')) as any,
        object: objectPop(ev.dataTransfer.getData('object')) as any,
        otype: ev.dataTransfer.getData('otype') as any,
      };
    }
    case 'dragFile': {
      return {
        type: 'dragFile',
        soure: objectPop(ev.dataTransfer.getData('source')) as any,
        path: ev.dataTransfer.getData('src') as any,
        mime: ev.dataTransfer.getData('mime') as any,
      };
    }
  }
  return undefined;
}
