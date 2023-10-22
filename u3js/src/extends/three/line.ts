import { WebGLRenderer, Scene, Camera, BufferGeometry, NormalBufferAttributes, Material, Group, Vector2, Vector3, CubicBezierCurve3, } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { addMaterialClass, addThreeClass, } from './utils';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { addNodeClass } from '../helper/clslib';

class BezierLineGeometry extends LineGeometry {
  public readonly isBezieoLineGeometry = true;

  toJSON(): any {
    const data: any = {
      metadata: {
        version: 4.6,
        type: 'BufferGeometry',
        generator: 'BufferGeometry.toJSON'
      }
    };

    // standard BufferGeometry serialization

    data.uuid = this.uuid;
    data.type = 'BufferGeometry';
    data.data = {};

    return data;
  }
}

export class BezierLineMaterial extends LineMaterial {
  public readonly isBezierLineMaterial = true;

  constructor() {
    super();
    this.type = 'BezierLineMaterial';
  }
}

export class BezierLine extends Line2 {
  public readonly isBezierLine = true;
  public readonly fromPosition = new Vector3();
  public readonly toPosition = new Vector3(1, 1, 0);
  public readonly ctrl1 = new Vector3(0.2, 0.1, 0);
  public readonly ctrl2 = new Vector3(0.8, 0.9, 0);
  public density = 10;

  protected _tmpSize = new Vector2();

  constructor() {
    super(new BezierLineGeometry(), new BezierLineMaterial());

    (this as any).type = 'BezierLine';

    this.material.worldUnits = true;
    this.material.linewidth = 0.1;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry<NormalBufferAttributes>, material: Material, group: Group) => {
      const { x, y } = renderer.getSize(this._tmpSize);
      if (this.material.resolution.x !== x || this.material.resolution.y !== y) {
        this.material.resolution.set(x, y);
        this.material.uniformsNeedUpdate = true;
      }
    }

    this.updatePositions();
  }

  updatePositions() {
    const curve = new CubicBezierCurve3(this.fromPosition, this.ctrl1, this.ctrl2, this.toPosition);
    const dist = Math.abs(this.fromPosition.clone().distanceTo(this.toPosition));
    const points = curve.getPoints(this.density * dist);
    this.geometry.setPositions(points.map(it => [it.x, it.y, it.z]).flat());
    this.computeLineDistances();
  }

  serialize(json: any) {
    //overwrite type
    json.type = 'BezierLine';
    json.fromPosition = this.fromPosition.toArray();
    json.toPosition = this.toPosition.toArray();
    json.ctrl1 = this.ctrl1.toArray();
    json.ctrl2 = this.ctrl2.toArray();
    json.density = this.density;
  }

  deserialize(json: any) {
    this.fromPosition.fromArray(json.fromPosition);
    this.toPosition.fromArray(json.toPosition);
    this.ctrl1.fromArray(json.ctrl1);
    this.ctrl2.fromArray(json.ctrl2);
    this.density = json.density;

    // replace geo type
    if (!(this.geometry instanceof BezierLineGeometry)) {
      this.geometry = new BezierLineGeometry();
    }

    this.updatePositions();
  }
}

addMaterialClass('BezierLineMaterial', BezierLineMaterial);

addThreeClass('BezierLine', {
  // cls: BezierLine,
  create: () => new BezierLine(),
  members: {
    fromPosition: 'Vector3',
    toPosition: 'Vector3',
    ctrl1: 'Vector3',
    ctrl2: 'Vector3',
    density: 'Number',
  },
  proto: 'Mesh',
  group: 'Objects.Bezier Line',
  icon: 'line',
});

addNodeClass('BezierLineMaterial', BezierLineMaterial, {
  color: 'Color',
  dashed: 'Boolean',
  dashScale: 'Number',
  dashSize: 'Number',
  dashOffset: 'Number',
  gapSize: 'Number',
  opacity: 'Number',
  linewidth: 'Number',
  alphaToCoverage: 'Boolean',
  worldUnits: 'Boolean',
}, 'ShaderMaterial', {
  bezierLineMaterial: { clsName: 'bezierLineMaterial', func: () => new BezierLineMaterial(), group: 'Material.Bezier Line Material', icon: 'brand-medium' },
});