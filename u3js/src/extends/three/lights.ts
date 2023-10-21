import { AmbientLight, DirectionalLight, HemisphereLight, PointLight, SpotLight, } from 'three';
import { addThreeClass } from "./utils";

addThreeClass('PointLight', {
  // cls: PointLight,
  create: () => {
    const light = new PointLight();
    light.shadow.mapSize.x = 2048;
    light.shadow.mapSize.y = 2048;
    // light.shadow.bias = -0.1;
    return light;
  },
  members: {},
  group: 'Lights.Point Light',
  icon: 'bulb',
});

addThreeClass('SpotLight', {
  // cls: SpotLight,
  create: () => {
    const light = new SpotLight();
    light.shadow.mapSize.x = 2048;
    light.shadow.mapSize.y = 2048;
    // light.shadow.bias = -0.1;
    return light;
  },
  members: {},
  group: 'Lights.Spot Light',
  icon: 'bulb',
});

addThreeClass('DirectionalLight', {
  // cls: DirectionalLight,
  create: () => {
    const light = new DirectionalLight();
    light.shadow.mapSize.x = 2048;
    light.shadow.mapSize.y = 2048;
    light.shadow.bias = -0.1;
    return light;
  },
  members: {},
  group: 'Lights.Directional Light',
  icon: 'bulb',
});

addThreeClass('AmbientLight', {
  // cls: AmbientLight,
  create: () => new AmbientLight(),
  members: {},
  group: 'Lights.Ambient Light',
  icon: 'bulb',
});

addThreeClass('HemisphereLight', {
  // cls: HemisphereLight,
  create: () => new HemisphereLight(),
  members: {},
  group: 'Lights.Hemisphere Light',
  icon: 'bulb',
});

