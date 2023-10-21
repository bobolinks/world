/* eslint-disable @typescript-eslint/no-this-alias */
import { ExtrudeGeometry, Material, MeshStandardMaterial, Object3DEventMap, Path, PlaneGeometry, ShapePath, Shape as ThreeShape, Vector2 } from 'three';
import { addThreeClass } from "./utils";
import { BodyType, Entity } from './entity';
import { Shape, } from './shape';

//-------------Plane---------------
export class Plane<
  TGeometry extends PlaneGeometry = PlaneGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isPlane = true;

  constructor(geometry?: TGeometry, material?: TMaterial) {
    super(geometry || new PlaneGeometry() as any, material || new MeshStandardMaterial() as any, BodyType.Ghost, 0);

    (this as any).type = 'Plane';
  }
}

addThreeClass('Plane', {
  create: ({ material, geometry }: any = {}) => new Plane(geometry, material),
  members: {
    'geo.width': 'Number',
    'geo.height': 'Number',
    'geo.widthSegments': 'Number',
    'geo.heightSegments': 'Number',
  },
  /** yes, we hide mass and body-type properties */
  proto: 'Mesh',
  group: 'Shapes.Plane',
  icon: 'plane',
});


//-------------Triangle---------------
export class ShapeTriangle<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Shape<TGeometry, TMaterial, TEventMap, { vec1: Vector2; vec2: Vector2; vec3: Vector2; }> {
  public readonly isShapeTriangle = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, { vec1: new Vector2(0, 0), vec2: new Vector2(1, 0), vec3: new Vector2(0, 1) }, bodyType, mass);

    (this as any).type = 'ShapeTriangle';
  }

  protected rebuildShapes() {
    const shapePath = new ShapePath();
    const shape = new ThreeShape();
    shapePath.subPaths.push(shape);

    const { vec1, vec2, vec3 } = this.props;

    shape.moveTo(vec1.x, vec1.y);
    shape.lineTo(vec2.x, vec2.y);
    shape.lineTo(vec3.x, vec3.y);
    shape.lineTo(vec1.x, vec1.y);

    this.shapes = shapePath.toShapes(false);

    this.rebuildGeometry();
  }
}

addThreeClass('ShapeTriangle', {
  create: ({ material, geometry }: any = {}) => new ShapeTriangle(geometry, material),
  members: {
    'props.vec1': 'Vector2',
    'props.vec2': 'Vector2',
    'props.vec3': 'Vector2',
  },
  proto: 'Shape',
  group: 'Shapes.Triangle',
  icon: 'triangle',
});


//-------------Square---------------
export class ShapeSquare<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Shape<TGeometry, TMaterial, TEventMap, { size: number; }> {
  public readonly isShapeSquare = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, { size: 1 }, bodyType, mass);

    (this as any).type = 'ShapeSquare';
  }

  protected rebuildShapes() {
    const shape = new ThreeShape();

    const { size } = this.props;

    shape.moveTo(0, 0);
    shape.lineTo(size, 0);
    shape.lineTo(size, size);
    shape.lineTo(0, size);
    shape.lineTo(0, 0);

    this.shapes = [shape];

    this.rebuildGeometry();
  }
}

addThreeClass('ShapeSquare', {
  create: ({ material, geometry }: any = {}) => new ShapeSquare(geometry, material),
  members: {
    'props.size': 'Number',
  },
  proto: 'Shape',
  group: 'Shapes.Square',
  icon: 'square',
});


//-------------Rounded rectangle---------------
export class ShapeRounded<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Shape<TGeometry, TMaterial, TEventMap, { width: number; height: number; radius: number; }> {
  public readonly isShapeTriangle = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, { width: 1, height: 1, radius: 0.2 }, bodyType, mass);

    (this as any).type = 'ShapeRounded';
  }

  protected rebuildShapes() {
    const shapePath = new ShapePath();
    const shape = new ThreeShape();
    shapePath.subPaths.push(shape);

    const { width, height, radius } = this.props;

    shape.moveTo(0, radius);
    shape.lineTo(0, height - radius);
    shape.quadraticCurveTo(0, height, radius, height);
    shape.lineTo(0 + width - radius, height);
    shape.quadraticCurveTo(width, height, width, height - radius);
    shape.lineTo(0 + width, radius);
    shape.quadraticCurveTo(width, 0, width - radius, 0);
    shape.lineTo(radius, 0);
    shape.quadraticCurveTo(0, 0, 0, radius);

    this.shapes = shapePath.toShapes(false);

    this.rebuildGeometry();
  }
}

addThreeClass('ShapeRounded', {
  create: ({ material, geometry }: any = {}) => new ShapeRounded(geometry, material),
  members: {
    'props.width': 'Number',
    'props.height': 'Number',
    'props.radius': 'Number',
  },
  proto: 'Shape',
  group: 'Shapes.Rounded rectangle',
  icon: 'square',
});


//-------------Circle---------------
export class ShapeCircle<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Shape<TGeometry, TMaterial, TEventMap, { radius: number; }> {
  public readonly isShapeTriangle = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, { radius: 1 }, bodyType, mass);

    (this as any).type = 'ShapeCircle';
  }

  protected rebuildShapes() {
    const shape = new ThreeShape();

    const { radius } = this.props;

    shape.moveTo(0, radius)
      .quadraticCurveTo(radius, radius, radius, 0)
      .quadraticCurveTo(radius, - radius, 0, - radius)
      .quadraticCurveTo(- radius, - radius, - radius, 0)
      .quadraticCurveTo(- radius, radius, 0, radius);

    this.shapes = [shape];

    this.rebuildGeometry();
  }
}

addThreeClass('ShapeCircle', {
  create: ({ material, geometry }: any = {}) => new ShapeCircle(geometry, material),
  members: {
    'props.radius': 'Number',
  },
  proto: 'Shape',
  group: 'Shapes.Circle',
  icon: 'ring',
});


//-------------Arc---------------
export class ShapeArc<
  TGeometry extends ExtrudeGeometry = ExtrudeGeometry,
  TMaterial extends Material | Material[] = Material | Material[],
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Shape<TGeometry, TMaterial, TEventMap, { radius: number; innerRadius: number; }> {
  public readonly isShapeTriangle = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, { radius: 1, innerRadius: 0.5, }, bodyType, mass);

    (this as any).type = 'ShapeArc';
  }

  protected rebuildShapes() {
    const shape = new ThreeShape();

    const { radius, innerRadius } = this.props;

    shape.moveTo(radius, 0)
      .absarc(0, 0, radius, 0, Math.PI * 2, false);

    const holePath = new Path()
      .moveTo(innerRadius, 0)
      .absarc(0, 0, innerRadius, 0, Math.PI * 2, true);

    shape.holes.push(holePath);

    this.shapes = [shape];

    this.rebuildGeometry();
  }
}

addThreeClass('ShapeArc', {
  create: ({ material, geometry }: any = {}) => new ShapeArc(geometry, material),
  members: {
    'props.radius': 'Number',
    'props.innerRadius': 'Number',
  },
  proto: 'Shape',
  group: 'Shapes.Arc Circle',
  icon: 'ring',
});
