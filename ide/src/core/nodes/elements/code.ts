import type * as Monaco from 'monaco-editor';
import { Input } from '../../../libs/flow';

declare const monaco: any;

export class CodeElement extends Input {
  protected updateInterval: number;
  protected editor: Monaco.editor.IStandaloneCodeEditor;
  private _source: string;

  constructor(source = '') {
    super(document.createElement('div'));

    this.updateInterval = 500;
    this._source = source;

    // (this.dom.style as any)['z-index'] = - 1;
    this.dom.classList.add('no-zoom');
    this.dom.style.width = '100%';
    this.dom.style.height = '360px';
    this.dom.style.marginTop = '6px';
    this.dom.style.marginBottom = '6px';

    this.editor = monaco.editor.create(this.dom, {
      value: this.getValue(),
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true
    });

    let timeout: any = null;

    (this.editor.getModel() as any).onDidChangeContent(() => {
      this._source = this.editor.getValue();
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.dispatchEvent(new Event('change'));
      }, this.updateInterval);
    });
  }

  setValue(value: string, dispatch = true) {
    if (this._source === value) return this;
    this._source = value;
    if (this.editor) this.editor.setValue(value);
    if (dispatch) this.dispatchEvent(new Event('change'));
    return this;
  }

  getValue() {
    return this._source;
  }

  setReadOnly(value: boolean) {
    this.editor.updateOptions({ readOnly: value });
    return this;
  }

  getReadOnly() {
    return this.editor.getRawOptions().readOnly;
  }

  focus() {
    if (this.editor) this.editor.focus();
  }
}
