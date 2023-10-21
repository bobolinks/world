import { EventDispatcher, Scene } from "three";
import type { DataKeyPoint, HistoryEventMap } from "./u3js/types/types";
import { logger } from "./u3js/extends/helper/logger";

type KeyChain = {
  cursor: number;
  points: Array<DataKeyPoint>;
};

export class HistoryManager extends EventDispatcher<HistoryEventMap> {
  private stores: Record<string, KeyChain> = {};
  private currentStore: KeyChain | null = null;
  private scene: Scene = null as any;
  private isLocked = false;

  constructor() {
    super();
  }

  setScene(scene: Scene): void {
    this.scene = scene;
    this.currentStore = this.stores[scene.uuid] || (this.stores[scene.uuid] = { cursor: 0, points: [] });
  }

  push(keypoint: DataKeyPoint): void {
    if (!this.currentStore) {
      throw logger.panic('Current store has not been selected!');
    }
    if (this.isLocked) {
      return;
    }
    if (this.currentStore.cursor !== this.currentStore.points.length) {
      // clear all histories in redoing list
      this.currentStore.points.length = this.currentStore.cursor;
    }
    this.currentStore.cursor++;
    this.currentStore.points.push(keypoint as any);
    this.dispatchEvent({ type: 'historyChanged', source: this });
  }

  canUndo(): boolean {
    if (!this.currentStore) {
      return false;
    }
    return !(this.currentStore.cursor < 1);
  }
  undo(): void {
    if (!this.currentStore) {
      throw logger.panic('Current store has not been selected!');
    }
    if (this.currentStore.cursor < 1) {
      return;
    }
    this.currentStore.cursor--;
    const point = this.currentStore.points[this.currentStore.cursor];
    this.isLocked = true;
    point.undo();
    this.isLocked = false;
    this.dispatchEvent({ type: 'historyChanged', source: this });
  }

  canRedo(): boolean {
    if (!this.currentStore) {
      return false;
    }
    return !(this.currentStore.cursor == this.currentStore.points.length);
  }
  redo(): void {
    if (!this.currentStore) {
      throw logger.panic('Current store has not been selected!');
    }
    if (this.currentStore.cursor == this.currentStore.points.length) {
      return;
    }
    const point = this.currentStore.points[this.currentStore.cursor];
    this.currentStore.cursor++;
    this.isLocked = true;
    point.redo();
    this.isLocked = false;
    this.dispatchEvent({ type: 'historyChanged', source: this });
  }
}