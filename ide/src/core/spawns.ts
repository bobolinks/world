import { Scene } from "three";
import { BuiltinSceneSpawns, } from "u3js/src";
import { addThreeClass } from "u3js/src/extends/three/utils";

export class SpawnsScene extends Scene {
  constructor() {
    super();
    this.name = BuiltinSceneSpawns;
  }
}

addThreeClass('SpawnsScene', {
  create: () => new SpawnsScene(),
  members: {},
  proto: 'PhysicalScene',
  group: '',
  icon: '',
});