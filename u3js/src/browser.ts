// fix nodes crash in file ModelNode.js
// code: export const modelViewMatrix = nodeImmutable( ModelNode, ModelNode.VIEW_MATRIX ).temp( 'ModelViewMatrix' );
import "three/examples/jsm/nodes/core/VarNode.js";
import "three/examples/jsm/nodes/Nodes.js";
import * as U3JS from './index';
export * from './index';

export type TU3JS = typeof U3JS;

declare global {
  interface Window {
    U3JS: TU3JS;
  }
}

if (!window.U3JS) {
  window.U3JS = U3JS;
}
