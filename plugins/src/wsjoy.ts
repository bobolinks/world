import { NodeTypeName } from 'u3js/dist/types';
import { ClsInfo, NodeConstructor } from 'u3js/src/types/plugin';

export function pluginInstall(
  addThreeClass: (name: string, info: ClsInfo) => void,
  addEffectClass: (name: string, info: ClsInfo) => void,
  addNodeClass: (name: string, cls: typeof Object.constructor, members?: { [key: string]: NodeTypeName }, base?: string, constructors?: Record<string, NodeConstructor>) => void,
  addNodeConstructor: (name: string, constr: NodeConstructor) => void,
) {

}