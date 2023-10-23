import { factor } from 'u3js/src/extends/accessors/factor';
import nodeList from './Nodes.json';

/// this file is only for test
type JsonItem = {
  shaderNode: string;
  children: JsonItem[];
  properties: Array<{ name: string }>;
};

const perfectProps: { [key: string]: Array<string>; } = {};

export function test() {
  const travse = (children: JsonItem[]) => {
    for (const it of children) {
      if (it.shaderNode && (factor as any)[it.shaderNode]) {
        perfectProps[it.shaderNode] = it.properties ? it.properties.map(e => e.name) : [];
      }
      if (it.children) {
        travse(it.children);
      }
    }
  }
  travse(nodeList.nodes as any);
  console.log(perfectProps);
}