import type { NodeProto, NodeTypeName, ThreeNode } from "./types";

// plugina
declare type ClsInfo = {
  create: (...params: any[]) => any;
  members: { [key: string]: NodeTypeName };
  proto?: string;
  group: string;
  icon: string;
};

type CreateFunc = () => ThreeNode;

declare type NodeProtoMore = NodeProto & {
  func: CreateFunc;
  title: string;
  group: string;
  icon: string;
};

declare type NodeConstructor = Omit<NodeProtoMore, 'in' | 'out' | 'name' | 'title'>;

declare function pluginInstall(
  addThreeClass: (name: string, info: ClsInfo) => void,
  addEffectClass: (name: string, info: ClsInfo) => void,
  addNodeClass: (name: string, cls: typeof Object.constructor, members?: { [key: string]: NodeTypeName }, base?: string, constructors?: Record<string, NodeConstructor>) => void,
  addNodeConstructor: (name: string, constr: NodeConstructor) => void,
): void;
