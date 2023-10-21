import { Color, ExtrudeGeometry, Material, MeshStandardMaterial, Object3DEventMap, Shape as ThreeShape, Vector2, Vector3 } from 'three';
import { addThreeClass, getProxyRawObject, objectPathAccessible, propsFromJson, propsToJson } from "./utils";
import { Entity } from './entity';

export type ShapePathCommand = 'A' | 'L' | 'M' | 'Q' | 'C' | 'Z';
export type ShapePathSequence = Array<ShapePathCommand | Array<number>>;

const defaultExtrudeOpts: ExtrudeGeometry['parameters']['options'] = {
  curveSegments: 12,
  steps: 1,
  depth: 1,
  bevelEnabled: true,
  bevelThickness: 0.2,
  bevelSize: 0.1,
  bevelOffset: 0,
  bevelSegments: 3,
};

export type ShapeProps = Record<string, boolean | number | string | Color | Vector2 | Vector3 | Array<number> | null>;

export class Shape<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
  TProps extends ShapeProps = ShapeProps,
> extends Entity<TGeometry, TMaterial, TEventMap, ExtrudeGeometry['parameters']['options']> {
  public readonly isShape = true;

  protected shapes: ThreeShape[] = [];
  protected props: TProps;

  constructor(geometry?: TGeometry, material?: TMaterial, props?: TProps, bodyType = 0, mass = 0) {
    super(geometry || new ExtrudeGeometry() as any, material || new MeshStandardMaterial() as any, bodyType, mass);

    (this as any).type = 'Shape';

    this.props = objectPathAccessible({ ...props }, () => {
      this.rebuildShapes();
    });

    if (!geometry) {
      this.rebuildShapes();
    }
  }

  protected get parameters(): ExtrudeGeometry['parameters']['options'] {
    const params = this.geometry.parameters?.options || {};
    if (!Object.keys(params).length) {
      return { ...defaultExtrudeOpts };
    }
    return params;
  }

  clone(recursive?: boolean | undefined): this {
    const cloned = super.clone(recursive);

    const props = (this.props as any)[getProxyRawObject];
    const json = propsToJson(props);
    const propsClone = (cloned.props as any)[getProxyRawObject];
    propsFromJson(propsClone, json);

    return cloned;
  }

  serialize(json: any) {
    super.serialize(json);

    const props = (this.props as any)[getProxyRawObject];
    json.props = propsToJson(props);
  }

  deserialize(json: any) {
    super.deserialize(json);

    if (json.props) {
      const props = (this.props as any)[getProxyRawObject];
      propsFromJson(props, json.props);
    }

    this.shapes = Array.isArray(this.geometry.parameters.shapes) ? this.geometry.parameters.shapes : [this.geometry.parameters.shapes];
  }

  protected rebuildShapes() {
    // do nothings
    this.rebuildGeometry();
  }

  protected rebuildGeometry() {
    const cls = this.geometry.constructor;
    this.geometry.dispose();
    const options = (this.geo as any)[getProxyRawObject];
    this.geometry = (cls as any).fromJSON({ shapes: this.shapes.map((v, i) => i), options }, this.shapes);
    this.geometry.applyMatrix4(this.geoMatrix);
    this.geometry.computeBoundingBox();
  }
}

addThreeClass('Shape', {
  create: ({ material, geometry }: any = {}) => new Shape(geometry, material),
  members: {
    'geo.curveSegments': 'Number',
    'geo.steps': 'Number',
    'geo.depth': 'Number',
    'geo.bevelEnabled': 'Boolean',
    'geo.bevelThickness': 'Number',
    'geo.bevelSize': 'Number',
    'geo.bevelOffset': 'Number',
    'geo.bevelSegments': 'Number',
  },
  proto: 'Entity',
  group: '',
  icon: '',
});
