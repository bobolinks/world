<template>
  <div class="code-container">
    <div class="header">
      <i class="icon-start" style="color: green" @click="excute" />
    </div>
    <div ref="codeEditor" class="code-body"></div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import * as Monaco from 'monaco-editor';
import { global } from '../../global';

declare const monaco: typeof Monaco;

let editor: Monaco.editor.IStandaloneCodeEditor;
const codeEditor = ref<HTMLDivElement>();
const script = ref(localStorage.getItem('script') || '');

function excute() {
  global.world.geometryEditors.Boll.execute(script.value);
  localStorage.setItem('script', script.value);
}

onMounted(() => {
  if (!codeEditor.value) {
    throw '';
  }
  editor = monaco.editor.create(codeEditor.value, {
    value: script.value,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
  });

  (editor.getModel() as any).onDidChangeContent(() => {
    script.value = editor.getValue();
  });
});

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>
<style scoped>
.code-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: calc(100% + 20px);
  margin: 0 -10px;
}

.code-container .header {
  display: flex;
  flex-direction: row;
  min-height: 32px;
  flex: 0 0 0%;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-end;
  align-items: center;
  padding: 0 1em;
  border-top: 1px solid #f2f2f2;
  border-bottom: 1px solid #f2f2f2;
  margin-bottom: 0.5rem;
}

.code-body {
  flex: 1 1 auto;
  border-radius: 6px;
  overflow: hidden;
}
</style>
