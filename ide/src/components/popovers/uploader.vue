<template>
  <el-dialog v-model="modelVisibleValue" :title="title" width="30%" draggable align-center @close="modelVisibleValue = false">
    <el-upload class="uploader" drag :action="url" multiple :file-list="fileList" :on-success="handleSuccess"
      :before-upload="beforeUpload" accept="image/*,audio/*,.glb,.fbx,.ttf,.js,.mjs,.cjs">
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ tip }}
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>
<script lang="ts" setup>
import { defineProps, ref, defineModel } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { store } from '../../store';
import { global } from '../../global';

const modelVisibleValue = defineModel();

defineProps({
  title: {
    type: String,
    default: '',
  },
  tip: {
    type: String,
    default: 'Accepts all image/audio/font/3dmodel files',
  },
});

const url = ref<string>(`/fs/upload/${store.state.projectName}`);

const fileList = ref<any[]>([]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleSuccess = (response: any, uploadFile: any) => {
  global.dispatchEvent({ type: 'assetsChanged' });
}

function beforeUpload(file: File) {
  if (/^image\//.test(file.type)) {
    return new File([file], `images@${file.name}`, { type: file.type });
  } else if (/^audio\//.test(file.type)) {
    return new File([file], `sounds@${file.name}`, { type: file.type });
  } else if (/^font\//.test(file.type)) {
    return new File([file], `fonts@${file.name}`, { type: file.type });
  } else if (/\.glb|\.fbx$/i.test(file.name)) {
    return new File([file], `models@${file.name}`, { type: file.type });
  } else if (/\.js|\.mjs|\.cjs$/i.test(file.name)) {
    return new File([file], `plugins@${file.name}`, { type: file.type });
  }
  return false;
}

</script>
<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.sec {
  position: relative;
  padding: 0.5em;
  margin: 1em 0;
}

.sec::before {
  position: absolute;
  content: attr(title);
  top: -1em;
  left: 0.2em;
}

.el-tag {
  margin: 0.2em 0.5em;
}

.item {
  margin-top: 8px;
  margin-right: 8px;
}
</style>
