import { ref, nextTick } from 'vue';

export default function useTextLabels(canvasSize) {
    // 文字标注相关
    const textLabels = ref([]);
    const movingLabel = ref(-1);
    const touchStartTime = ref(0);
    const touchStartPos = ref({ x: 0, y: 0 });
    const touchEndTime = ref(0);
    const touchCount = ref(0);
    const touchTimer = ref(null);
    const labelOffset = ref({ x: 0, y: 0 });
    const longPressDetected = ref(false);

    // 文字标签样式
    function getLabelStyle(label) {
        return {
            left: `${label.x}px`,
            top: `${label.y}px`,
            zIndex: 25
        };
    }

    // 触摸开始 - 用于移动设备上的双击和长按检测
    function handleLabelTouchStart(idx, e) {
        const currentMode = 'text'; // 在实际使用中应该从主组件传入
        if (currentMode!== 'text') return;// 如果当前模式不是 'text'，则直接返回，不执行后续操作
        if (textLabels.value[idx].editing) {
            e.stopPropagation();
            return;
        }// 检查当前标签是否处于编辑状态，如果是，则阻止事件冒泡并返回

        touchStartTime.value = Date.now();// 记录触摸开始的时间（用于后续判断是否为长按）
        const touch = e.touches[0];// 获取触摸事件中的第一个触摸点

        // 获取容器的绝对位置
        const container = document.querySelector('.numbers-table-container');
        const containerRect = container? container.getBoundingClientRect() : { left: 0, top: 0 };
        const containerAbsTop = containerRect.top + window.scrollY;
        const containerAbsLeft = containerRect.left + window.scrollX;

        // 计算label的绝对位置
        const currentLabel = textLabels.value[idx];
        const labelAbsX = currentLabel.x + containerAbsLeft;
        const labelAbsY = currentLabel.y + containerAbsTop;

        // 记录触摸开始位置（页面坐标）
        touchStartPos.value = {
            x: touch.pageX,
            y: touch.pageY,
        };
		// highlighted.value.push({ touch.pageX, touch.pageY });
// toggleHighlight(touch.pageX, touch.pageY);
        // 计算偏移量（页面坐标 - label绝对坐标）
        labelOffset.value = {
            x: touch.pageX - labelAbsX,
            y: touch.pageY - labelAbsY
        };

        // 增加触摸计数
        touchCount.value++;

        // 检测双击（两次触摸在短时间内）
        if (touchCount.value === 2) {
            // 清除之前的计时器
            if (touchTimer.value) {
                clearTimeout(touchTimer.value);
                touchTimer.value = null;
            }

            // 确认是双击
            handleDoubleTap(idx);
            touchCount.value = 0;
        } else {
            // 设置计时器，重置触摸计数
            touchTimer.value = setTimeout(() => {
                touchCount.value = 0;
            }, 300); // 300ms内的两次触摸视为双击
        }

        // 启动长按检测
        setTimeout(() => {
            if (touchCount.value === 1 &&
                Date.now() - touchStartTime.value > 500 && // 长按超过500ms
                !longPressDetected.value) {
                longPressDetected.value = true;
                handleLongPress(idx); // 长按也进入编辑模式，作为双击的备用方案
            }
        }, 500);

        e.stopPropagation();
        e.preventDefault();
    }

    // 触摸移动 - 处理文字标签拖动
    function handleLabelTouchMove(idx, e) {
        // 获取当前模式（实际应用中应从主组件传入）
        const currentMode = 'text';
        
        // 如果当前不是文本模式或已检测到长按，则退出函数
        if (currentMode !== 'text' || longPressDetected.value) return;
    
        // 获取触摸事件中的第一个触摸点
        const touch = e.touches[0];
		
        
        // 计算触摸点从起始位置移动的水平距离和垂直距离（绝对值）
        const moveX = Math.abs(touch.clientX - touchStartPos.value.x);
        const moveY = Math.abs(touch.clientY - touchStartPos.value.y);
    
        // 如果移动距离超过阈值（5像素），则执行移动操作
        if (moveX > 5 || moveY > 5) {
            // 设置当前移动的标签索引
            movingLabel.value = idx;

            // 获取包含数字表格的容器元素
            const container = document.querySelector('.numbers-table-container');
            
            // 获取容器的位置信息（如果不存在则使用默认值）
            const containerRect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
            
            // 计算容器的绝对位置（考虑页面滚动偏移）
            const containerAbsTop = containerRect.top + window.scrollY;
            const containerAbsLeft = containerRect.left + window.scrollX;
    
            // 计算标签的新位置（考虑标签偏移和容器位置）
            let newX = touch.pageX - labelOffset.value.x - containerAbsLeft;
            let newY = touch.pageY - labelOffset.value.y - containerAbsTop;
    
            // 设置标签在画布内的最大Y位置（底部限制）
            const maxY = canvasSize.value.h;
    
            // 限制标签在画布范围内（X轴：0到画布宽度-100，Y轴：0到最大Y值）
            textLabels.value[idx].x = Math.max(0, Math.min(newX, canvasSize.value.w - 100));
            textLabels.value[idx].y = Math.max(0, Math.min(newY, maxY));

        }
    
        // 阻止事件冒泡和默认行为
        e.stopPropagation();
        e.preventDefault();
		// console.log('1'),
    }

    // 触摸结束 - 清理状态
    function handleLabelTouchEnd(idx, e) {
        const currentMode = 'text'; // 在实际使用中应该从主组件传入
        if (currentMode!== 'text') return;

        touchEndTime.value = Date.now();
        movingLabel.value = -1;
        longPressDetected.value = false;

        e.stopPropagation();
        e.preventDefault();
    }

    // 处理单击（鼠标设备）
    function handleLabelClick(idx) {
        const currentMode = 'text'; // 在实际使用中应该从主组件传入
		
        // 仅在非编辑状态下响应
        if (currentMode === 'text' &&!textLabels.value[idx].editing) {
            // 单击不做任何操作，等待可能的双击
        }
    }

    // 处理双击（鼠标设备）
    function handleLabelDblClick(idx) {
        const currentMode = 'text'; // 在实际使用中应该从主组件传入
        if (currentMode === 'text') {
            editLabel(idx);
        }
    }

    // 处理双击（触摸设备）
    function handleDoubleTap(idx) {
        editLabel(idx);
    }

    // 处理长按（作为双击的备用方案）
    function handleLongPress(idx) {
        editLabel(idx);
    }

    // 添加文字功能
    function addTextLabel() {
        // 获取画布位置，确保文字添加在可见区域且不在前两列
        const canvasRect = document.querySelector('.draw-canvas')?.getBoundingClientRect();
        let x = 100;
        let y = 100;

        if (canvasRect) {
            // 获取前两列的总宽度
            const table = document.querySelector('.numbers-table');
            if (table) {
                const firstCol = table.querySelector('.col-1');
                const secondCol = table.querySelector('.col-2');
                if (firstCol && secondCol) {
                    const firstColWidth = firstCol.getBoundingClientRect().width;
                    const secondColWidth = secondCol.getBoundingClientRect().width;
                    x = firstColWidth + secondColWidth + 20; // 在前两列右侧添加偏移
                }
            }
            y = canvasRect.height / 3;
        }

        const newLabel = {
            id: Date.now(), // 唯一ID
            x: x,
            y: y,
            text: '双击或长按编辑',
            editing: false
        };

        textLabels.value.push(newLabel);

        // 强制更新DOM
        nextTick(() => {
            const lastIdx = textLabels.value.length - 1;
            editLabel(lastIdx);
        });
    }

    // 编辑文字标签 - 增强版确保焦点
    function editLabel(idx) {
        const currentMode = 'text'; // 在实际使用中应该从主组件传入
        if (currentMode!== 'text') return;

        // 退出其他标签的编辑状态
        textLabels.value.forEach((label, i) => {
            label.editing = i === idx;
        });

        nextTick(() => {
            // 获取文字元素并设置焦点
            const elements = document.querySelectorAll('.text-label');
            if (elements[idx]) {
                const content = elements[idx].querySelector('.text-content');
                if (content) {
                    // 确保元素可编辑
                    content.setAttribute('contenteditable', 'true');
                    content.focus();

                    // 选中所有文本
                    const range = document.createRange();
                    range.selectNodeContents(content);
                    range.collapse(false); // 光标移到内容末尾
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // 在移动设备上触发虚拟键盘
                    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                        content.click();
                        setTimeout(() => content.focus(), 100);
                    }
                }
            }
        });
    }

    function updateLabelText(idx, e) {
        if (textLabels.value[idx]) {
            textLabels.value[idx].text = e.target.innerText;
        }
    }

    function finishEditLabel(idx) {
        if (textLabels.value[idx]) {
            textLabels.value[idx].editing = false;
            // 如果文本为空则删除标签
            if (!textLabels.value[idx].text.trim()) {
                textLabels.value.splice(idx, 1);
            }
        }
		
    }
	
	
	

    return {
        textLabels,
        movingLabel,
        touchStartTime,
        touchStartPos,
        touchEndTime,
        touchCount,
        touchTimer,
        labelOffset,
        longPressDetected,
        handleLabelTouchStart,
        handleLabelTouchMove,
        handleLabelTouchEnd,
        handleLabelClick,
        handleLabelDblClick,
        addTextLabel,
        editLabel,
        updateLabelText,
        finishEditLabel,
        getLabelStyle
    };
}