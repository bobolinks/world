import { TimerNode } from 'three/examples/jsm/nodes/Nodes';
import type { GraphNode, HistoryManager } from 'u3js/src/types/types';
import { ButtonInput, Element, LabelElement, NumberInput } from '../../../libs/flow';
import { Graph, } from 'u3js/src/extends/graph/graph';
import { InputEditor } from './input';
import { NodeEditorParams } from '../NodeEditor';

export class TimerEditor extends InputEditor {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<TimerNode>, params: NodeEditorParams) {
    super(name, history, graph, node, params);

    const updateField = () => {
      field.setValue((node.scoped.value as any).toFixed(3));
    };

    const field = new NumberInput().onChange(() => {
      node.scoped.value = field.getValue();
    });

    const scaleField = new NumberInput(1).onChange(() => {
      node.scoped.scale = scaleField.getValue();
    });

    const moreElement = new Element().add(new ButtonInput('Reset').onClick(() => {
      node.scoped.value = 0;
      updateField();
    })).setSerializable(false);

    this.add(new Element().add(field).setSerializable(false))
      .add(new LabelElement('Speed').add(scaleField))
      .add(moreElement);

    // extends node
    (node.scoped as any)._update = node.scoped.update;
    node.scoped.update = function (...params) {
      (node.scoped as any)._update(...params);
      updateField();
    };
  }
}
