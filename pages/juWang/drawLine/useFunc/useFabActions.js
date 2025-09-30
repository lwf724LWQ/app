import { ref } from 'vue';

export default function useFabActions(currentMode, canvasPointerEvents, shapes, textLabels, highlighted, redraw) {
    // 控制Fab是否展开
    const isFabOpen = ref(false);

    // 切换Fab展开/收起
    function toggleFab() {
        isFabOpen.value =!isFabOpen.value;
    }

    // 切换模式 - 根据模式设置Canvas事件穿透
    function switchMode(mode) {
        currentMode.value = mode;
        const isDrawing = false;
        const isErasing = false;
        const movingLabel = -1;

        // 重置当前形状（假设在主组件中定义了此函数）
        // resetCurrentShape();

        // 清除临时画布（假设在主组件中定义了此函数）
        // clearTempCanvas();

        redraw(false);

        // 根据模式设置Canvas是否接收事件
        if (mode === 'text') {
            canvasPointerEvents.value = 'auto'; // 文字模式下Canvas不接收事件
        } else {
            canvasPointerEvents.value = 'auto'; // 绘图模式下Canvas接收事件
        }

        toggleFab(); // 切换模式后关闭Fab菜单
    }

    // 清空画布
    function clearCanvas() {
        shapes.value = [];
        textLabels.value = [];
        highlighted.value = [];

        // 清除临时画布（假设在主组件中定义了此函数）
        // clearTempCanvas();

        redraw(false);
    }

    // 空白点击处理
    function clickBlank() {
        canvasPointerEvents.value = 'auto';
        toggleFab(); // 切换模式后关闭Fab菜单
    }

    return {
        isFabOpen,
        toggleFab,
        switchMode,
        clearCanvas,
        clickBlank
    };
}
