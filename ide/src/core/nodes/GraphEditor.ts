import * as THREE from 'three';
import * as Nodes from 'three/examples/jsm/nodes/Nodes';
import type { GraphEvent, GraphEventMap, GraphNode, HistoryManager, LinkPoint, ThreeNode, UserEventMap, UserEventName } from '../u3js/types/types';
import { Canvas, ButtonInput, StringInput, ContextMenu, Search, Node, TreeViewNode, TreeViewInput, Element } from '../../libs/flow';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { NodeMaterial } from 'three/examples/jsm/nodes/Nodes';
import { Graph, } from '../u3js/extends/graph/graph';
import { createEditorFromNode } from './editors';
import { parseDragParams } from '../drags';
import { NodeProtoMore, createThreeNode, getProto, tree } from '../u3js/extends/helper/clslib';
import { ObjectNode } from '../u3js/extends/nodes/object';
import { ScriptBlockNode } from '../u3js/extends/nodes/block';
import { NodeEditor } from './NodeEditor';
import { editorsCahced } from './editorsCached';
import { logger } from '../u3js/extends/helper/logger';

declare module 'three' {
  interface Object3D {
    nodes?: Array<ThreeNode>;
  }
}

const { global } = Nodes as any;

Element.icons.unlink = 'ti ti-unlink';

export type GraphEditorEvent = GraphEvent | UserEventName;
export type GraphEditorEventMap = GraphEventMap & UserEventMap;

export class GraphEditor extends THREE.EventDispatcher<GraphEditorEventMap> {
  public readonly uuid = THREE.MathUtils.generateUUID();
  public readonly domElement: HTMLElement;

  private canvas: Canvas;
  private search = new Search();
  private nodesContext: ContextMenu;

  protected object: THREE.Object3D;
  protected graph: Graph = null as any;

  private _eventForward: any;
  private _eventDrop: any;

  constructor(private scene: THREE.Scene, private renderer: THREE.Renderer, composer: EffectComposer, public readonly history: HistoryManager) {
    super();

    this._eventForward = (e: any) => {
      if (e.type === 'graphModified') {
        this.updateAllMaterialNodes();
      }
      this.dispatchEvent(e);
    }

    const domElement = document.createElement('flow');
    const canvas = new Canvas();

    this.nodesContext = new ContextMenu(canvas.canvas).setWidth(300);

    domElement.append(canvas.dom);

    canvas.dom.children[0].addEventListener('drop', (e: any) => {
      this.onDrop(e);
    });

    this.object = null as any;

    global.set('THREE', THREE);
    global.set('TSL', Nodes);

    global.set('scene', scene);
    global.set('renderer', renderer);
    global.set('composer', composer);

    this.canvas = canvas;
    this.domElement = domElement;

    this.initSearch();
    this.initNodesContext();
    this.initShortcuts();

    // this.setObject(scene);

    // test
    // test();
  }

  setSize(width: number, height: number) {
    this.canvas.setSize(width, height);
    return this;
  }

  update() {
    for (const editor of this.canvas.nodes) {
      (editor as NodeEditor).update();
    }
  }

  private centralizeNode(node: any, graphNode: GraphNode) {
    const canvas = this.canvas;
    const nodeRect = node.dom.getBoundingClientRect();
    const x = ((canvas.width / 2) - canvas.scrollLeft) - nodeRect.width;
    const y = ((canvas.height / 2) - canvas.scrollTop) - nodeRect.height;

    graphNode.anchor.x = x;
    graphNode.anchor.y = y;
    node.setPosition(x, y);

    return this;
  }

  private addWithProtoName(name: string) {
    const proto = getProto(name);
    if (!proto) {
      throw logger.panic(`Node[${name}] not found!`);
    }
    return this.addWithProto(proto);
  }

  private addWithProto(proto: NodeProtoMore) {
    const node = createThreeNode(proto.name);
    return this.addThreeNode(node, proto.name, proto.title || proto.name, proto.icon);
  }

  private addThreeNode(threeNode: ThreeNode, name: string, title: string, icon: string) {
    if (threeNode instanceof ObjectNode) {
      threeNode.createDefault(this.object);
    }
    const node = this.graph.newGraphNode(threeNode, name);
    return this.addNode(node, name, title, icon);
  }

  private addNode(node: GraphNode, name: string, title: string, icon: string, centralized: boolean = true) {
    const editor = createEditorFromNode(title, this.history, this.graph, node, { icon });
    editor.rmCallback = () => {
      this.history.push({
        tip: `Remove node[${node.scoped.uuid}]`,
        undo: () => {
          this.addNode(node, name, title, icon, false);
        },
        redo: () => {
          const editor = editorsCahced[node.scoped.uuid];
          this.graph.remove(node);
          editor.dispose();
        },
      });
    };
    this.graph.add(node);
    this.canvas.add(editor);
    if (centralized) {
      this.centralizeNode(editor, node);
    }
    this.canvas.select(editor);
    return node;
  }

  private removeNode(node: GraphNode) {
    const editor: NodeEditor = this.canvas.nodes.find((e: any) => e.node === node) as any;
    editor.dispose();
    this.graph.remove(node);
  }

  private getEditorFromUuid(uuid: string) {
    const node = this.graph.get(uuid);
    return this.canvas.nodes.find((e: any) => e.node.sc === node);
  }

  setScene(scene: THREE.Scene) {
    this.scene = scene;
  }

  setObject(object: THREE.Object3D) {
    if (this.object === object) {
      // just update
      this.update();
      return;
    }
    this.clear();
    this.object = object;
    if (this.graph) {
      this.graph.removeEventListener('graphAdded', this._eventForward);
      this.graph.removeEventListener('graphModified', this._eventForward);
      this.graph.removeEventListener('graphConnected', this._eventForward);
      this.graph.removeEventListener('graphRemoved', this._eventForward);
    }
    if (!object.graph) {
      object.graph = new Graph(object);
    }
    this.graph = object.graph;
    if (this.graph.nodes.length) {
      this.loadGraph();
    } else {
      this.createDefault();
    }
    this.graph.addEventListener('graphAdded', this._eventForward);
    this.graph.addEventListener('graphModified', this._eventForward);
    this.graph.addEventListener('graphConnected', this._eventForward);
    this.graph.addEventListener('graphRemoved', this._eventForward);
  }

  private updateAllMaterialNodes() {
    for (const node of this.graph.nodes) {
      if (node.scoped instanceof THREE.Material) {
        node.scoped.needsUpdate = true;
        if (node.scoped instanceof NodeMaterial) {
          node.scoped.uniformsNeedUpdate = true;
        }
      }
    }
  }

  private onDrop(e: DragEvent) {
    const data = parseDragParams(e);
    if (!data) {
      return;
    }
    if (data.type === 'dragNodeClass') {
      const proto = getProto(data.name);
      if (!proto) {
        throw logger.panic(`Node[${data.name}] not found!`);
      }
      const node = this.addWithProto(proto);
      this.history.push({
        tip: `Add node [class=${data.name}]`,
        undo: () => {
          this.removeNode(node);
        },
        redo: () => {
          this.addNode(node, proto.name, proto.title || proto.name, proto.icon);
        },
      });
    }
  }

  private clear() {
    if (this.graph) {
      this.graph.isLocked = true;
    }
    this.canvas.clear();
    if (this.graph) {
      this.graph.isLocked = false;
    }
  }

  dispose() {
    if (this._eventForward) {
      this.graph.removeEventListener('graphAdded', this._eventForward);
      this.graph.removeEventListener('graphModified', this._eventForward);
      this.graph.removeEventListener('graphConnected', this._eventForward);
      this.graph.removeEventListener('graphRemoved', this._eventForward);
      this._eventForward = null;
    }
    if (this._eventDrop) {
      this.canvas.dom.children[1].removeEventListener('drop', this._eventDrop);
      this._eventDrop = null;
    }
  }

  private createDefault() {
    this.addWithProtoName('object3DRef');
  }

  private loadGraph() {
    for (const node of this.graph.nodes) {
      const creator = getProto(node.name);
      if (!creator) {
        throw logger.panic(`Node[${node.name}] not found!`);
      }
      const editor = createEditorFromNode(creator.title || creator.name, this.history, this.graph, node, { icon: creator.icon });
      this.canvas.add(editor);
    }
    // now load links
    for (const editor of this.canvas.nodes as NodeEditor[]) {
      const node: GraphNode = editor.node;
      if (node.scoped instanceof ScriptBlockNode && node.scoped.prev) {
        // link block chain
        const prev = node.scoped.prev;
        const prevEditor: NodeEditor = this.canvas.nodes.find((e: any) => e.node.scoped === prev) as any;
        if (!prevEditor) {
          throw logger.panic(`Editor not found!`);
        }
        editor.title.connect(prevEditor.title);
      }
      for (const element of editor.elements) {
        const linkPoint: LinkPoint = element.getObject() as any;
        if (!linkPoint || !linkPoint.field) {
          continue;
        }
        const bound = node.bounds[linkPoint.field];
        if (!bound) {
          continue;
        }
        const peerElement = this.getElementFrom(bound.node, bound.field);
        if (!peerElement) {
          throw logger.panic(`Element[field=${bound.field}] not found!`);
        }
        element.connect(peerElement);
      }
    }
  }

  private getElementFrom(node: GraphNode, field?: string) {
    const editor: NodeEditor = this.canvas.nodes.find((e: any) => e.node === node) as any;
    if (!editor) {
      return undefined;
    }
    for (const element of editor.elements) {
      const linkPoint: LinkPoint = element.getObject() as any;
      if (!linkPoint) {
        continue;
      }
      if (linkPoint.field === field) {
        return element;
      }
    }
  }

  private initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target === document.body) {
        const key = e.key;
        if (key === 'Tab') {
          this.search.inputDOM.focus();
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    });
  }

  private initSearch() {
    const traverseNodeEditors = (item: any) => {
      if (item.children) {
        for (const subItem of item.children) {
          traverseNodeEditors(subItem);
        }
      } else if (item.name == 'object3DRef') {
        return;
      } else {
        const button = new ButtonInput(item.title || item.name);
        button.setIcon(`ti ti-${item.icon}`);
        button.addEventListener('complete', () => {
          this.addWithProto(item);
        });

        search.add(button);
        if (item.tags !== undefined) {
          search.setTag(button, item.tags);
        }
      }
    };

    const search = new Search();
    search.forceAutoComplete = true;

    search.onFilter(async () => {
      search.clear();
      for (const item of tree) {
        traverseNodeEditors(item);
      }
    });

    search.onSubmit(() => {
      if (search.currentFiltered !== null) {
        search.currentFiltered.button.dispatchEvent(new Event('complete'));
      }
    });

    this.search = search;
    this.domElement.append((search as any).dom);
  }

  private async initNodesContext() {
    const context = this.nodesContext;

    const contextPosition: any = {};

    context.onContext(() => {
      const { relativeClientX, relativeClientY } = this.canvas as any;
      contextPosition.x = Math.round(relativeClientX);
      contextPosition.y = Math.round(relativeClientY);
    });

    context.addEventListener('show', () => {
      reset();
      focus();
    });

    //**************//
    // INPUTS
    //**************//

    const nodeButtons: any[] = [];

    let nodeButtonsVisible: any[] = [];
    let nodeButtonsIndex = - 1;

    const focus = () => requestAnimationFrame(() => search.inputDOM.focus());
    const reset = () => {
      search.setValue('', false);
      for (const button of nodeButtons) {
        button.setOpened(false).setVisible(true).setSelected(false);
      }
    };

    const node = new Node();
    context.add(node);

    const search = new StringInput().setPlaceHolder('Search...').setIcon('ti ti-list-search');

    search.inputDOM.addEventListener('keydown', (e: any) => {
      const key = e.key;
      if (key === 'ArrowDown') {
        const previous = nodeButtonsVisible[nodeButtonsIndex];
        if (previous) previous.setSelected(false);
        const current = nodeButtonsVisible[nodeButtonsIndex = (nodeButtonsIndex + 1) % nodeButtonsVisible.length];
        if (current) current.setSelected(true);
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (key === 'ArrowUp') {
        const previous = nodeButtonsVisible[nodeButtonsIndex];
        if (previous) previous.setSelected(false);
        const current = nodeButtonsVisible[nodeButtonsIndex > 0 ? --nodeButtonsIndex : (nodeButtonsIndex = nodeButtonsVisible.length - 1)];
        if (current) current.setSelected(true);
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (key === 'Enter') {
        if (nodeButtonsVisible[nodeButtonsIndex] !== undefined) {
          nodeButtonsVisible[nodeButtonsIndex].dom.click();
        } else {
          context.hide();
        }
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (key === 'Escape') {
        context.hide();
      }
    });

    search.onChange(() => {
      const value = search.getValue().toLowerCase();

      if (value.length === 0) return reset();

      nodeButtonsVisible = [];
      nodeButtonsIndex = 0;

      for (const button of nodeButtons) {
        const buttonLabel = button.getLabel().toLowerCase();

        button.setVisible(false).setSelected(false);

        const visible = buttonLabel.indexOf(value) !== - 1;

        if (visible && button.children.length === 0) {
          nodeButtonsVisible.push(button);
        }
      }

      for (const button of nodeButtonsVisible) {
        let parent = button;

        while (parent !== null) {
          parent.setOpened(true).setVisible(true);
          parent = parent.parent;
        }
      }

      if (nodeButtonsVisible[nodeButtonsIndex] !== undefined) {
        nodeButtonsVisible[nodeButtonsIndex].setSelected(true);
      }

    });

    const treeView = new TreeViewInput();
    node.add(new Element().setHeight(30).add(search));
    node.add(new Element().setHeight(200).add(treeView));

    const addNodeEditorElement = (nodeData: any) => {
      const button = new TreeViewNode(nodeData.title || nodeData.name);
      button.setIcon(`ti ti-${nodeData.icon}`);

      if (nodeData.children === undefined) {
        button.isNodeClass = true;
        button.onClick(async () => {
          this.addWithProto(nodeData);
        });
      }

      if (nodeData.tip) {
        //button.setToolTip( item.tip );
      }

      nodeButtons.push(button);

      if (nodeData.children) {
        for (const subItem of nodeData.children) {
          if (subItem.name == 'object3DRef') {
            continue;
          }
          const subButton = addNodeEditorElement(subItem);
          button.add(subButton);
        }
      }
      return button;
    };

    //
    // const nodeList = await getNodeList();

    for (const node of tree) {
      const button = addNodeEditorElement(node);
      treeView.add(button);
    }
  }
}
