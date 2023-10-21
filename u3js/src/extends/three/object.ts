import { Object3D } from "three";
import { addThreeClass } from "./utils";

addThreeClass('Object3D', {
  // cls: Object3D,
  create: () => new Object3D(),
  members: {},
  group: 'Objects.Empty Object3D',
  icon: 'box',
});
