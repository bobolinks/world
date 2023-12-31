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
    'geo.width': 'Number',
    'geo.height': 'Number',
    'geo.depth': 'Number',
    'geo.widthSegments': 'Number',
    'geo.heightSegments': 'Number',
    'geo.depthSegments': 'Number',
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
    'geo.radius': 'Number',
    'geo.length': 'Number',
    'geo.capSegments': 'Number',
    'geo.radialSegments': 'Number',
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
    'geo.radius': 'Number',
    'geo.height': 'Number',
    'geo.radialSegments': 'Number',
    'geo.heightSegments': 'Number',
    'geo.openEnded': 'Boolean',
    'geo.thetaStart': 'Number',
    'geo.thetaLength': 'Number',
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
    'geo.radiusTop': 'Number',
    'geo.radiusBottom': 'Number',
    'geo.height': 'Number',
    'geo.radialSegments': 'Number',
    'geo.heightSegments': 'Number',
    'geo.openEnded': 'Boolean',
    'geo.thetaStart': 'Number',
    'geo.thetaLength': 'Number',
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
    'geo.radius': 'Number',
    'geo.widthSegments': 'Number',
    'geo.heightSegments': 'Number',
    'geo.phiStart': 'Number',
    'geo.phiLength': 'Number',
    'geo.phiSegments': 'Number',
    'geo.thetaStart': 'Number',
    'geo.thetaLength': 'Number',
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
    'geo.radius': 'Number',
    'geo.tube': 'Number',
    'geo.radialSegments': 'Number',
    'geo.tubularSegments': 'Number',
    'geo.arc': 'Number',
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
    'geo.radius': 'Number',
    'geo.tube': 'Number',
    'geo.radialSegments': 'Number',
    'geo.tubularSegments': 'Number',
    'geo.p': 'Number',
    'geo.q': 'Number',
  },
  proto: 'Entity',
  group: 'Entities.TorusKnot',
  icon: 'pipe',
});
