import { ExtrudeGeometry, Material, MeshStandardMaterial, Object3DEventMap, Shape as ThreeShape, } from 'three';
import { addThreeClass, getProxyRawObject, propsFromJson, propsToJson } from "./utils";
import { Entity, EntityProps } from './entity';

export type ShapePathCommand = 'A' | 'L' | 'M' | 'Q' | 'C' | 'Z';
export type ShapePathSequence = Array<ShapePathCommand | Array<number>>;

type ShapeProps = Omit<ExtrudeGeometry['parameters']['options'], 'extrudePath' | 'UVGenerator'>;

const defaultExtrudeOpts: ShapeProps = {
  curveSegments: 12,
  steps: 1,
  depth: 1,
  bevelEnabled: true,
  bevelThickness: 0.2,
  bevelSize: 0.1,
  bevelOffset: 0,
  bevelSegments: 3,
};

export class Shape<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
  TProps extends EntityProps = ShapeProps,
> extends Entity<TGeometry, TMaterial, TEventMap, TProps> {
  public readonly isShape = true;

  protected shapes: ThreeShape[] = [];
  // protected props: TProps;

  constructor(geometry?: TGeometry, material?: TMaterial, props?: TProps, bodyType = 0, mass = 0) {
    super(geometry || new ExtrudeGeometry() as any, material || new MeshStandardMaterial() as any, bodyType, mass);

    (this as any).type = 'Shape';

    if (!geometry) {
      this.rebuildShapes();
    }
  }

  protected get parameters(): TProps {
    const params: TProps = (this.geometry.parameters?.options || {}) as any;
    if (!Object.keys(params).length) {
      return { ...defaultExtrudeOpts } as TProps;
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

  deserialize(json: any) {
    super.deserialize(json);

    this.shapes = Array.isArray(this.geometry.parameters.shapes) ? this.geometry.parameters.shapes : [this.geometry.parameters.shapes];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPropsChanged(key: string, value: any) {
    this.rebuildShapes();
  }

  protected rebuildShapes() {
    // do nothings
    this.rebuildGeometry();
  }

  protected rebuildGeometry() {
    const cls = this.geometry.constructor;
    this.geometry.dispose();
    const options = (this.props as any)[getProxyRawObject];
    this.geometry = (cls as any).fromJSON({ shapes: this.shapes.map((v, i) => i), options }, this.shapes);
    this.geometry.applyMatrix4(this.geoMatrix);
    this.geometry.computeBoundingBox();
  }
}

addThreeClass('Shape', {
  create: ({ material, geometry }: any = {}) => new Shape(geometry, material),
  members: {
    'props.curveSegments': 'Number',
    'props.steps': 'Number',
    'props.depth': 'Number',
    'props.bevelEnabled': 'Boolean',
    'props.bevelThickness': 'Number',
    'props.bevelSize': 'Number',
    'props.bevelOffset': 'Number',
    'props.bevelSegments': 'Number',
  },
  proto: 'Entity',
  group: '',
  icon: '',
});
