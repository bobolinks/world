import { Object3D } from 'three';
import type { GraphNode, HistoryManager, LinkPoint, NodePin, PinDirect, ThreeNode, } from '../../u3js/types/types';
import { ButtonInput, SelectInput, StringInput, LabelElement, Element, Input } from '../../../libs/flow';
import { PinTypeSupported, ScriptNode } from '../../u3js/extends/nodes/script';
import { Graph, } from '../../u3js/extends/graph/graph';
import { getPinsByNode } from '../../u3js/extends/helper/clslib';
import { NodeEditor, NodeEditorParams } from '../NodeEditor';
import { createElementFieldFromNode } from '../elements';
import { consumeChain } from '../elements/elements';
import { editorsCahced } from '../editorsCached';

const typeNames: Array<PinTypeSupported> = ['Boolean', 'Number', 'String', 'Color', 'Vector2', 'Vector3', 'Vector4', 'Euler', 'bool', 'float', 'color', 'vec2', 'vec3', 'vec4'];

function iconButton(icon: string) {
  const btn = new ButtonInput();
  btn.setIcon(`ti ti-${icon}`);
  btn.dom.classList.toggle('flat-button');
  return btn;
}

function createTypeInputElement(label: string) {
  const element = new LabelElement(label);

  const nameInput = new StringInput('')
  const typeInput = new SelectInput(typeNames.map(e => ({ name: e, value: e })), typeNames[1]);

  return element.add(nameInput).add(typeInput);
}

const createField = (editor: NodeEditor, graph: Graph, node: GraphNode<any>, scoped: ThreeNode | Object3D, field: string, desc: NodePin<any>, io: PinDirect, editable: boolean) => {
  const element = createElementFieldFromNode(scoped, field, desc);
  if (editable) {
    const btn = iconButton('trash');
    btn.onClick(() => {
      if (graph.removeType(node, field, io)) {
        editor.remove(element);
        element.dispose();
        editor.invalidate();
      }
    });
    element.add(btn);
  }
  element.setObject({ node, field, io } as LinkPoint);
  element.addEventListener('changeInput', () => editor.invalidate(field, io));
  return element;
};

function makeHistoryAdd(history: HistoryManager, graph: Graph, node: GraphNode<any>, field: string, type: string, io: PinDirect) {
  return history.push({
    tip: `Add type[${type}] to node[${node.scoped.uuid}][io=${io}]`,
    undo: () => {
      if (!graph.removeType(node, field, io)) {
        return;
      }
      const editor: NodeEditor = editorsCahced[node.scoped.uuid] as any;
      if (editor) {
        const element = editor.elements.find(e => {
          const data = e.getObject();
          if (!data) {
            return false;
          }
          return data.field === field && data.io === io;
        });
        if (element) {
          editor.remove(element);
          element.dispose();
        }
        editor.invalidate();
      }
    },
    redo: () => {
      if (!graph.addType(node, field, type, io)) {
        return;
      }
      const editor: NodeEditor = editorsCahced[node.scoped.uuid] as any;
      if (editor) {
        const typesExtended = node.scoped.typesExtended;
        const objects = node.scoped.getObjectsExtended();
        const element = createField(editor, graph as any, node, objects[io], field, typesExtended[io][field], io, true);
        const elements = editor.elements.filter(e => e.getObject() === 0x777);
        if (io === 'in') {
          element.setOutput(0);
          editor.add(element, elements[0]);
        } else {
          element.setInput(0);
          editor.add(element, elements[1]);
        }
        element.setObject({ node, io, field } as LinkPoint);
        editor.invalidate();
      }
    },
  });
}

export class ScriptEditor<T extends ScriptNode = ScriptNode> extends NodeEditor<T> {
  constructor(name: string, history: HistoryManager, graph: Graph, node: GraphNode<T>, params: NodeEditorParams) {
    super(name, history, graph, node, { removable: true, input: 0, output: 0, ...params });

    this.title.setColor(0x996600);

    if (!this.node.anchor.width) {
      this.setWidth(420);
    }

    const scriptNode = node.scoped;

    const types = getPinsByNode(node.name);
    const inFiledsSet = new Set(['object', 'enabled']);
    Object.keys(types.in).forEach(e => {
      if (e !== 'code') {
        inFiledsSet.add(e);
      }
    });
    inFiledsSet.add('code');

    // basical fields, only input
    for (const field of [...inFiledsSet]) {
      const desc = types.in[field];
      let element: Element;
      if (field === 'object') {
        element = new LabelElement('uuid');
        consumeChain.Object3D(node.scoped, field, element, 'Object3D', {}, []);
        element.inputs[0].dom.ondrop = null;
      } else {
        element = createElementFieldFromNode(node.scoped, field, desc);
        element.addEventListener('changeInput', () => this.invalidate());
      }
      element.setInput(0);
      element.setOutput(0);
      this.add(element);
    }

    const codeElement = this.elements[this.elements.length - 1];
    const funcTipElem = new LabelElement('main(params, out) {');
    if (!scriptNode.editable) {
      (codeElement.inputs[0] as any as Input).setReadOnly(true);
      codeElement.setEnabledInputs(false);
    }
    this.add(funcTipElem, codeElement);

    const typesExtended = node.scoped.typesExtended;
    const objects = node.scoped.getObjectsExtended();

    for (const [field, desc] of Object.entries(typesExtended.in)) {
      const element = createField(this, graph, node, objects.in, field, desc, 'in', scriptNode.editable);
      element.setOutput(0);
      element.setObject({ node, io: 'in', field } as LinkPoint);
      this.add(element, funcTipElem);
    }

    if (scriptNode.editable) {
      const elementAddIn = createTypeInputElement('[New Input]');
      const btnAddIn = iconButton('new-section');
      btnAddIn.onClick(() => {
        const field = (elementAddIn.inputs[0] as any).getValue();
        const type = (elementAddIn.inputs[1] as any).getValue();
        if (graph.addType(node, field, type, 'in')) {
          const element = createField(this, graph, node, objects.in, field, typesExtended.in[field], 'in', scriptNode.editable);
          element.setOutput(0);
          element.setObject({ node, io: 'in', field } as LinkPoint);
          this.add(element, elementAddIn);
          this.invalidate();
          makeHistoryAdd(history, graph, node, field, type, 'in');
        }
      });
      elementAddIn.add(btnAddIn);
      elementAddIn.setObject(0x777);
      this.add(elementAddIn, funcTipElem);
    }

    for (const [field, desc] of Object.entries(typesExtended.out)) {
      const element = createField(this, graph, node, objects.out, field, desc, 'out', scriptNode.editable);
      element.setInput(0);
      element.setObject({ node, io: 'out', field } as LinkPoint);
      this.add(element, funcTipElem);
    }

    if (scriptNode.editable) {
      const elementAddOut = createTypeInputElement('[New Output]');
      const btnAddOut = iconButton('new-section');
      btnAddOut.onClick(() => {
        const field = (elementAddOut.inputs[0] as any).getValue();
        const type = (elementAddOut.inputs[1] as any).getValue();
        if (graph.addType(node, field, type, 'out')) {
          const element = createField(this, graph, node, objects.out, field, typesExtended.out[field], 'out', scriptNode.editable);
          element.setInput(0);
          element.setObject({ node, io: 'out', field } as LinkPoint);
          this.add(element, elementAddOut);
          this.invalidate();
          makeHistoryAdd(history, graph, node, field, type, 'out');
        }
      });
      elementAddOut.setObject(0x777);
      elementAddOut.add(btnAddOut);
      this.add(elementAddOut, funcTipElem);
    }
  }
}
