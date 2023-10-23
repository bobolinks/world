import type { NodeTypeName } from 'u3js/dist/types';
import type { ClsInfo, NodeConstructor } from 'u3js/src/types/plugin';
import { Box } from 'u3js';
import { BoxGeometry, Color, MeshBasicMaterial, MeshStandardMaterial } from 'three';

class BoxTest extends Box {
  readonly isBoxTest = true;

  constructor(geometry?: BoxGeometry, material?: MeshBasicMaterial, bodyType?: number, mass?: number) {
    super(geometry, material, bodyType, mass);

    (this as any).type = 'BoxTest';
  }

  get color() {
    return this.material.color;
  }
  set color(val: Color) {
    this.material.color.copy(val);
  }
}

export function pluginInstall(
  addThreeClass: (name: string, info: ClsInfo) => void,
  addEffectClass: (name: string, info: ClsInfo) => void,
  addNodeClass: (name: string, cls: typeof Object.constructor, members?: { [key: string]: NodeTypeName }, base?: string, constructors?: Record<string, NodeConstructor>) => void,
  addNodeConstructor: (name: string, constr: NodeConstructor) => void,
) {
  addThreeClass('BoxTest', {
    create: ({ geometry, material }: any = {}) => new BoxTest(geometry, material),
    members: {
      color: 'Color',
    },
    group: 'Entities.Custom Box component from plugin',
    icon: '',
  });
}