import { useOldManModeStore } from '@/stores/oldManMode'

export default {
  provide() {
    const store = useOldManModeStore()
    return {
      useOldManModeStore: store
    }
  }
}