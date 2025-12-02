<script lang="ts" setup>
import { useOldManModeStore, oldManModeStoreKey } from './stores/oldManMode'
import { provide } from 'vue'

// 初始化并提供 store
const oldManModeStore = useOldManModeStore()
provide(oldManModeStoreKey, oldManModeStore)
provide("useOldManModeStore", oldManModeStore)
</script>

<style>
/*每个页面公共css */
@import '@/static/iconfont-draw-line.css';
</style>
