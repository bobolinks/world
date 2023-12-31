import { BuiltinSceneSpawns, PhysicalScene } from "./u3js";
import { addThreeClass } from "./u3js/extends/three/utils";

export class SpawnsScene extends PhysicalScene {
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