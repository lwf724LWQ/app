<template>
  <uni-popup ref="popup" v-bind="$attrs">
    <slot></slot>
  </uni-popup>
</template>

<script setup>
import { ref } from "vue";
// #ifdef H5 || APP
import { onBackPress } from "@dcloudio/uni-app";
// #endif

const popup = ref(null);
const isPopupOpen = ref(false); // 弹出层是否开启
const open = () => {
  popup.value.open();
  // #ifdef H5 || APP
  isPopupOpen.value = true;
  // #endif
};
const close = () => {
  popup.value.close();
  // #ifdef H5 || APP
  isPopupOpen.value = false;
  // #endif
};
defineExpose({
  open,
  close,
});

// #ifdef H5 || APP
onBackPress(() => {
  if (!isPopupOpen.value) return;

  close();
  return true;
});
// #endif
</script>
