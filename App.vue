<script lang="ts" setup>
import { useOldManModeStore, oldManModeStoreKey } from "./stores/oldManMode";
import { provide } from "vue";

// 初始化并提供 store
const oldManModeStore = useOldManModeStore();
provide(oldManModeStoreKey, oldManModeStore);
provide("useOldManModeStore", oldManModeStore);
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/static/iconfont-draw-line.css";

:root {
  // 浅色文字
  --light-text-color: #1215d3;
}
</style>
