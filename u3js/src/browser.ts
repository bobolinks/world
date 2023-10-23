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
