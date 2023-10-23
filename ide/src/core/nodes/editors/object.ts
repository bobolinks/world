import { Object3D, Texture } from 'three';
import type { GraphNode, HistoryManager, LinkPoint } from 'u3js/src/types/types';
import { Element, LabelElement } from '../../../libs/flow';
import { ObjectNode } from 'u3js/src/extends/nodes/object';
import { Graph, } from 'u3js/src/extends/graph/graph';
import { getPinsByNode } from 'u3js/src/extends/helper/clslib';
import { NodeEditor, NodeEditorParams } from '../NodeEditor';
import { createElementFieldFromNode } from '../elements';
import { consumeChain } from '../elements/elements';

export class ObjectEditor<T extends Object3D | Texture = Object3D> extends NodeEditor<ObjectNode<T>> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<ObjectNode<T>>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: !node.scoped.isObject3DNode, input: 0, output: 0, ...params });
    this.title.titleDOM.innerText = `${node.scoped.objectType} Reference`;

    if (!this.node.anchor.width) {
      this.setWidth(360);
    }

    const types = getPinsByNode(node.name);

    for (const [field, desc] of Object.entries(types.in)) {
      let element: Element;
      if (field === 'object') {
        element = new LabelElement('uuid');
        consumeChain.Object3D(node.scoped, field, element, 'Object3D', {}, []);
        element.inputs[0].dom.ondrop = null;
      } else {
        element = createElementFieldFromNode(node.scoped, field, desc);
      }
      element.setInput(0);
      element.setOutput(0);
      this.add(element);
    }

    const typesExtended = node.scoped.typesExtended;
    const objects = node.scoped.getObjectsExtended();

    for (const [field, desc] of Object.entries(typesExtended.in)) {
      const element = createElementFieldFromNode(objects.in, field, desc);
      element.setOutput(0);
      element.setObject({ node, field } as LinkPoint);
      element.addEventListener('changeInput', () => this.invalidate(field, 'in'));
      this.add(element);
    }
    for (const [field, desc] of Object.entries(typesExtended.out)) {
      const element = createElementFieldFromNode(objects.out, field, desc);
      element.setObject({ node, io: 'out', field } as LinkPoint);
      element.addEventListener('changeInput', () => this.invalidate(field, 'out'));
      element.setInput(0);
      this.add(element);
    }
  }
}
