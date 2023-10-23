import type { GraphNode, PinDirect, ThreeNode, HistoryManager } from 'u3js/src/types/types';
import { BoundType, Graph, } from "u3js/src/extends/graph/graph";
import { Node as FlowNode, ButtonInput, TitleElement, ContextMenu, Element } from '../../libs/flow';
import { editorsCahced } from './editorsCached';

export type NodeEditorParams = {
  icon?: string;
  removable?: boolean;
  input?: number;
  output?: number;
};

export class NodeEditor<T extends ThreeNode = ThreeNode> extends FlowNode {
  public readonly title: TitleElement;
  protected context: ContextMenu;

  private _onPositionChanged: any;

  public rmCallback: any;

  constructor(name: string, public readonly history: HistoryManager, public readonly graph: Graph, public readonly node: GraphNode<T>, params: NodeEditorParams) {
    super();

    editorsCahced[node.scoped.uuid] = this;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this._onPositionChanged = (e: any) => {
      const { x, y } = this.getPosition();
      if (x !== node.anchor.x || y !== node.anchor.y) {
        node.anchor.x = x;
        node.anchor.y = y;
        graph.dispatchEvent({ type: 'graphModified', soure: null as any, nodes: [node] });
      }
    };

    this.dom.addEventListener('positionChanged', this._onPositionChanged);

    this.setWidth(this.node.anchor.width || 300);
    this.setPosition(node.anchor.x, node.anchor.y);

    const title = new TitleElement(name)
      .setObject({ node })
      .setSerializable(false);

    const contextButton = new ButtonInput().onClick(() => {
      context.open();
    }).setIcon('ti ti-dots');

    const onAddButtons = () => {
      context.removeEventListener('show', onAddButtons);
      if (params.removable) {
        context.add(new ButtonInput('Remove').setIcon('ti ti-trash').onClick(() => {
          this.removeSelf();
        }));
      }
      context.add(new ButtonInput('Isolate').setIcon('ti ti-3d-cube-sphere').onClick(() => {
        this.context.hide();
        this.title.dom.dispatchEvent(new MouseEvent('dblclick'));
      }));
    };

    const context = new ContextMenu(this.dom);
    context.addEventListener('show', onAddButtons);

    if (params.input !== undefined) {
      title.setInput(params.input);
    }
    if (params.output !== undefined) {
      title.setOutput(params.output);
    }
    this.title = title;

    if (params.icon) this.icon = params.icon;

    this.context = context;

    title.addButton(contextButton);

    this.add(title);
  }

  set icon(name: string) {
    this.title.setIcon('ti ti-' + name);
  }

  add(element: Element, before?: Element) {
    if (element.inputLength || element.outputLength) {
      element.onValid((source: Element, target: Element) => {
        if (!target) {
          return false;
        }
        const sourceObject = source.getObject();
        const targetObject = target.getObject();
        return !!this.graph.connect(targetObject, sourceObject, true);
      });

      element.onConnect((source: Element) => {
        if (this.graph.isLocked) {
          return;
        }
        const sourceObject = source.getObject();
        const target = source.getLinkedObject();
        if (!target) {
          return this.graph.disconnect(sourceObject);
        }
        const boundType = this.graph.connect(target, sourceObject);
        source.getLink().dashed = boundType === BoundType.Push;
        return boundType;
      });
    }

    return super.add(element, before);
  }

  get(field: string) {
    return this.elements.find(e => e.name === field);
  }

  private removeSelf() {
    this.graph.remove(this.node);
    this.dispose();
    if (this.rmCallback) {
      this.rmCallback();
    }
  }

  update() {
    for (const element of this.elements) {
      for (const input of element.inputs) {
        if ((input as any).update) {
          (input as any).update();
        }
      }
    }
  }

  invalidate(field?: string, io?: PinDirect) {
    this.graph.dispatchEvent({ type: 'graphModified', soure: null as any, nodes: [this.node] });
    if (field) {
      this.graph.applyNodePins(this.node, field, io);
    }
  }

  dispose() {
    this.dom.removeEventListener('positionChanged', this._onPositionChanged);
    this.context.hide();
    super.dispose();
    delete editorsCahced[this.node.scoped.uuid];
  }
}
