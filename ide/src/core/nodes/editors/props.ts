import type { ThreeNode, GraphNode, LinkPoint, HistoryManager } from '../../u3js/types/types';
import { Graph, } from '../../u3js/extends/graph/graph';
import { getPinsByNode } from '../../u3js/extends/helper/clslib';
import { NodeEditor, NodeEditorParams } from '../NodeEditor';
import { createElementFieldFromNode } from '../elements';
import { perfectProps } from '../accessors/props';

export class PropsEditor<T extends ThreeNode> extends NodeEditor<T> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<T>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: true, output: 1, ...params });

    if (!this.node.anchor.width) {
      this.setWidth(360);
    }

    const types = getPinsByNode(node.name);
    const perfect = perfectProps[node.name as keyof typeof perfectProps];
    const entries = Object.entries(types.in).filter((e) => {
      if (!perfect) {
        return true;
      }
      return (perfect as any).includes(e[0]);
    });

    for (const [field, desc] of entries) {
      const element = createElementFieldFromNode(node.scoped, field, desc);
      element.setOutput(0);
      element.setObject({ node, io: 'in', field } as LinkPoint);
      element.addEventListener('changeInput', () => this.invalidate(field, 'in'));
      this.add(element);
    }
  }
}
