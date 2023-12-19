/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BufferGeometry, EventDispatcher,
  MeshStandardMaterial,
  WebGLRenderer
} from "three";
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { MeshBVH } from "three-mesh-bvh";
import { ADDITION, Brush, Evaluator, INTERSECTION, SUBTRACTION } from "three-bvh-csg";
import type { HistoryManager } from "u3js/src/types/types";
import { SceneEditorEventMap } from "./event";
import { GeometryEditor } from "./geometry";

export class BollEditor extends GeometryEditor {
  private evaluator = new Evaluator();
  private result = new Brush(new BufferGeometry(), new MeshStandardMaterial({
    flatShading: false,
    polygonOffset: true,
    polygonOffsetUnits: 0.1,
    polygonOffsetFactor: 0.1,
  }));

  constructor(
    public readonly renderer: WebGLRenderer,
    public readonly size: { width: number; height: number },
    public readonly history: HistoryManager,
    public readonly dispatcher: EventDispatcher<SceneEditorEventMap>
  ) {
    super(renderer, size, history, dispatcher);
  }

  execute(script: string) {
    const scoped = this;
    const context = new Proxy({
      add(brush: Brush) {
        const source = new Brush(scoped.mesh.geometry.toNonIndexed(), new MeshStandardMaterial());
        brush.updateMatrixWorld();
        source.prepareGeometry();
        scoped.evaluator.evaluate(source, brush, ADDITION, source);
        scoped.replaceGeometry(source.geometry);
      },
      sub(brush: Brush) {
        console.warn('sub->begin');
        const source = new Brush(scoped.mesh.geometry.toNonIndexed(), new MeshStandardMaterial());
        brush.updateMatrixWorld();
        source.prepareGeometry();
        scoped.evaluator.evaluate(source, brush, SUBTRACTION, source);
        scoped.replaceGeometry(source.geometry);
        console.warn('sub->end');
      },
      intersect(brush: Brush) {
        const source = new Brush(scoped.mesh.geometry.toNonIndexed(), new MeshStandardMaterial());
        brush.updateMatrixWorld();
        source.prepareGeometry();
        scoped.evaluator.evaluate(source, brush, INTERSECTION, source);
        scoped.replaceGeometry(source.geometry);
      },
    }, {
      get(target, p, receiver) {
        if (typeof p !== 'string' || ['add', 'sub', 'intersect']) {
          return Reflect.get(target, p, receiver);
        }
        return scoped.getObjectByName(p)
      },
    });
    const scene = this.getObjectByProperty('type', 'OperationScene');
    if (scene) {
      for (const child of scene.children) {
        if (!child.name || child.name === '[target]') {
          continue;
        } else if (child.name.length !== 1 || Object.hasOwn(context, child.name)) {
          continue;
        }
        (context as any)[child.name] = child;
      }
    }
    const code = `with(cxt) { ${script} }`;
    const func = new Function('cxt', code);
    func(context);
  }

  replaceGeometry(geometry: BufferGeometry) {
    if (!this._object) {
      return;
    }

    const oldGeo = this.mesh.geometry;

    if (!geometry.index) {
      geometry = mergeVertices(geometry);
    }

    if (!this.mesh.geometry.boundsTree) {
      this.mesh.geometry.boundsTree = new MeshBVH(this.mesh.geometry);
    }

    this.mesh.geometry.dispose();
    this.mesh.geometry = geometry;
    this._object.geometry = geometry;

    const undo = () => {
      this.mesh.geometry.dispose();
      this.mesh.geometry = oldGeo;
      this._object!.geometry = oldGeo;
      this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
    };
    const redo = () => {
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
      this._object!.geometry = geometry;
      this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
    };
    this.dispatcher.dispatchEvent({ type: 'objectModified', soure: this, objects: [this.mesh] });
    this.history.push({
      tip: 'Geo Replaced!',
      undo,
      redo,
    });
  }
}
