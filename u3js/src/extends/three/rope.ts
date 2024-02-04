import {
  WebGLRenderer, Scene, Camera, BufferGeometry, NormalBufferAttributes,
  Material, Group, Object3DEventMap, Vector2, Vector3,
} from 'three';
import { addThreeClass, } from './utils';
import { BezierLineGeometry, BezierLineMaterial } from './line';
import { BodyType, Entity } from './entity';
import { AmmoUtils } from '../../libs/ammo';

type RopeParamters = {
  density: number;
  anchor1?: string;
  anchor2?: string;
};

//// todos, unfinished

export class Rope<
  TGeometry extends BezierLineGeometry = BezierLineGeometry,
  TMaterial extends BezierLineMaterial = BezierLineMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap, RopeParamters> {
  public readonly isRope = true;

  private _tmpSize = new Vector2();
  private _isConnected = false;
  private _anchor1?: Entity;
  private _anchor2?: Entity;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    super(geometry, material || new BezierLineMaterial() as any);

    (this as any).type = 'Rope';

    if (!material) {
      this.material.worldUnits = true;
      this.material.linewidth = 0.1;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onBeforeRender = (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry<NormalBufferAttributes>, material: Material, group: Group) => {
      const { x, y } = renderer.getSize(this._tmpSize);
      if (this.material.resolution.x !== x || this.material.resolution.y !== y) {
        this.material.resolution.set(x, y);
        this.material.uniformsNeedUpdate = true;
      }
      if (!this._isConnected) {
        this.connect(scene);
      }
      if (this._isConnected) {
        this.updatePositions();
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPropsChanged(key: string, value: any) {
    this.rebuildGeometry();
  }

  private connect(scene: Scene) {
    if (!this.props.anchor1 || !this.props.anchor2) {
      return;
    }
    if (!this._anchor1 || this._anchor1.uuid !== this.props.anchor1) {
      this._anchor1 = scene.getObjectByProperty('uuid', this.props.anchor1) as any;
    }
    if (!this._anchor2 || this._anchor2.uuid !== this.props.anchor2) {
      this._anchor2 = scene.getObjectByProperty('uuid', this.props.anchor2) as any;
    }
    if (this._anchor1 && this._anchor2) {
      this._isConnected = true;
    }
  }

  private updatePositions() {
    if (!this._anchor1 || !this._anchor2) {
      return;
    }

    const geo = this.geometry;
    const softBody: Ammo.btSoftBody = this.physicalBody as any;
    const ropePositions = this.geometry.attributes.position.array;
    const numVerts = ropePositions.length / 3;
    const nodes = softBody.get_m_nodes();
    let indexFloat = 0;

    for (let i = 0; i < numVerts; i++) {
      const node = nodes.at(i);
      const nodePos = node.get_m_x();
      ropePositions[indexFloat++] = nodePos.x();
      ropePositions[indexFloat++] = nodePos.y();
      ropePositions[indexFloat++] = nodePos.z();
    }

    // let lineSegments;

    // if (array instanceof Float32Array) {
    //   lineSegments = array;
    // } else if (Array.isArray(array)) {
    //   lineSegments = new Float32Array(array);
    // }

    // const instanceBuffer = new InstancedInterleavedBuffer(lineSegments, 6, 1); // xyz, xyz

    // geo.setAttribute('instanceStart', new InterleavedBufferAttribute(instanceBuffer, 3, 0)); // xyz
    // geo.setAttribute('instanceEnd', new InterleavedBufferAttribute(instanceBuffer, 3, 3)); // xyz

    //

    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    return this;
  }

  protected rebuildBody() {
    const world = this.world;

    // remove old body first
    if (this.physicalBody) {
      if (this.world) {
        this.world.removeMesh(this);
      }
      AmmoUtils.destroyBody(this.physicalBody);
    }

    // create body
    if (this._bodyType === BodyType.SoftBody) {
      const from = this._anchor1?.position || new Vector3(0, 0.1, 0);
      const to = this._anchor2?.position || new Vector3(0, 0, 0);
      const dist = Math.abs(from.distanceTo(to));
      const segments = this.props.density * dist;
      (this as any).physicalBody = AmmoUtils.createRope(new Vector3(0, 0.1, 0), new Vector3(), this._mass, segments) as any;
      this.physicalBody.setUserIndex(this.id);
      if (world) {
        world.addMesh(this, this.physicalBody);
      }
    } else {
      (this as any).physicalBody = null as any;
    }
  }

}

addThreeClass('Rope', {
  create: () => new Rope(),
  members: {
    fromPosition: 'Vector3',
    toPosition: 'Vector3',
    density: 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Rope',
  icon: 'line',
});
