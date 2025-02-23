<template>
    <div>
      <div ref="editorContainer" style="height: 300px;"></div>
    </div>
  </template>
  
  <script>
  import * as monaco from "monaco-editor";
  import { ref, onMounted } from "vue";
  
  export default {
    props: ["modelValue"],
    setup(props, { emit }) {
      const editorContainer = ref(null);
      let editorInstance = null;
  
      onMounted(() => {
        editorInstance = monaco.editor.create(editorContainer.value, {
          value: props.modelValue,
          language: "javascript",
          theme: "vs-dark",
        });
  
        editorInstance.onDidChangeModelContent(() => {
          emit("update:modelValue", editorInstance.getValue());
        });
      });
  
      return { editorContainer };
    },
  };
  </script>
  