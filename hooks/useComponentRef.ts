import { ref } from 'vue'

// 创建一个组件ref引用 并提供完整类型标准
export const useComponentRef = <T extends abstract new (...args: any[]) => any>(_component: T) => {
    return ref<InstanceType<T>>()
}