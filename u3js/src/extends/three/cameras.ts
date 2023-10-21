import { OrthographicCamera, PerspectiveCamera, } from 'three';
import { addThreeClass } from "./utils";

addThreeClass('PerspectiveCamera', {
  // cls: PerspectiveCamera,
  create: () => new PerspectiveCamera(),
  members: {},
  group: 'Cameras.Perspective Camera',
  icon: 'camera',
});

addThreeClass('OrthographicCamera', {
  // cls: OrthographicCamera,
  create: () => new OrthographicCamera(),
  members: {},
  group: 'Cameras.Orthographic Camera',
  icon: 'camera',
});
