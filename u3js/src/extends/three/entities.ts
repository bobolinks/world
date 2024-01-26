import {
  BoxGeometry, CapsuleGeometry, ConeGeometry, CylinderGeometry, Material,
  MeshBasicMaterial, MeshStandardMaterial, Object3DEventMap, SphereGeometry,
  TorusGeometry, TorusKnotGeometry,
} from "three";
import { addThreeClass, } from "./utils";
import { Entity } from "./entity";

//-------------Box---------------
export class Box<
  TGeometry extends BoxGeometry = BoxGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isBox = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'Box';
  }
}

addThreeClass('Box', {
  create: ({ material, geometry }: any = {}) => new Box(geometry, material || new MeshStandardMaterial()),
  members: {
    'props.width': 'Number',
    'props.height': 'Number',
    'props.depth': 'Number',
    'props.widthSegments': 'Number',
    'props.heightSegments': 'Number',
    'props.depthSegments': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Box',
  icon: 'box',
});

//-------------Capsule---------------
export class Capsule<
  TGeometry extends CapsuleGeometry = CapsuleGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isCapsule = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'Capsule';
  }
}

addThreeClass('Capsule', {
  create: ({ material, geometry }: any = {}) => new Capsule(geometry || new CapsuleGeometry(), material || new MeshStandardMaterial()),
  members: {
    'props.radius': 'Number',
    'props.length': 'Number',
    'props.capSegments': 'Number',
    'props.radialSegments': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Capsule',
  icon: 'capsule',
});

//-------------Cone---------------
export class Cone<
  TGeometry extends ConeGeometry = ConeGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isCone = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'Cone';
  }
}

addThreeClass('Cone', {
  create: ({ material, geometry }: any = {}) => new Cone(geometry || new ConeGeometry(), material || new MeshStandardMaterial()),
  members: {
    'props.radius': 'Number',
    'props.height': 'Number',
    'props.radialSegments': 'Number',
    'props.heightSegments': 'Number',
    'props.openEnded': 'Boolean',
    'props.thetaStart': 'Number',
    'props.thetaLength': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Cone',
  icon: 'cone',
});

//-------------Cylinder---------------
export class Cylinder<
  TGeometry extends CylinderGeometry = CylinderGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isCylinder = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'Cylinder';
  }
}

addThreeClass('Cylinder', {
  create: ({ material, geometry }: any = {}) => new Cylinder(geometry || new CylinderGeometry(), material || new MeshStandardMaterial()),
  members: {
    'props.radiusTop': 'Number',
    'props.radiusBottom': 'Number',
    'props.height': 'Number',
    'props.radialSegments': 'Number',
    'props.heightSegments': 'Number',
    'props.openEnded': 'Boolean',
    'props.thetaStart': 'Number',
    'props.thetaLength': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Cylinder',
  icon: 'cylinder',
});

//-------------Sphere---------------
export class Sphere<
  TGeometry extends SphereGeometry = SphereGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isSphere = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'Sphere';
  }
}

addThreeClass('Sphere', {
  create: ({ material, geometry }: any = {}) => new Sphere(geometry || new SphereGeometry(), material || new MeshStandardMaterial()),
  members: {
    'props.radius': 'Number',
    'props.widthSegments': 'Number',
    'props.heightSegments': 'Number',
    'props.phiStart': 'Number',
    'props.phiLength': 'Number',
    'props.phiSegments': 'Number',
    'props.thetaStart': 'Number',
    'props.thetaLength': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Sphere',
  icon: 'sphere',
});

//-------------Torus---------------
export class Torus<
  TGeometry extends TorusGeometry = TorusGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isTorus = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'Torus';
  }
}

addThreeClass('Torus', {
  create: ({ material, geometry }: any = {}) => new Torus(geometry || new TorusGeometry(), material || new MeshStandardMaterial()),
  members: {
    'props.radius': 'Number',
    'props.tube': 'Number',
    'props.radialSegments': 'Number',
    'props.tubularSegments': 'Number',
    'props.arc': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.Torus',
  icon: 'ring',
});

//-------------TorusKnot---------------
export class TorusKnot<
  TGeometry extends TorusKnotGeometry = TorusKnotGeometry,
  TMaterial extends Material = MeshBasicMaterial,
  TEventMap extends Object3DEventMap = Object3DEventMap,
> extends Entity<TGeometry, TMaterial, TEventMap> {
  public readonly isTorusKnot = true;

  constructor(geometry?: TGeometry, material?: TMaterial, bodyType = 0, mass = 0) {
    super(geometry, material, bodyType, mass);
    (this as any).type = 'TorusKnot';
  }
}

addThreeClass('TorusKnot', {
  create: ({ material, geometry }: any = {}) => new TorusKnot(geometry || new TorusKnotGeometry(), material || new MeshStandardMaterial()),
  members: {
    'props.radius': 'Number',
    'props.tube': 'Number',
    'props.radialSegments': 'Number',
    'props.tubularSegments': 'Number',
    'props.p': 'Number',
    'props.q': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.TorusKnot',
  icon: 'pipe',
});
