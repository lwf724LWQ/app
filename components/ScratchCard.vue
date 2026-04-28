<template>
  <view class="scratch-container">
    <!-- 动画包裹层 -->
    <view
      :id="`scratchWrapper${id}`"
      class="scratch-wrapper"
      :class="{ 'animate-open': isOpen, 'animate-close': !isOpen }"
      :prop="{ isOpen, isNeedScratch, id }"
      :change:prop="scratch.initScratchCard"
    >
      <!-- 底层内容 (Slot) -->
      <view class="scratch-content">
        <slot></slot>
      </view>

      <!-- 教程 -->
      <view
        class="scratch-tutorial scratch-tutorial-show"
        v-show="isNeedTutorial"
        :id="`scratchTutorial${id}`"
      >
        <view class="scratch-tutorial-text">左右滑动此处可刮开</view>
        <view class="scratch-tutorial-icon"></view>
      </view>
    </view>
  </view>
</template>

<script>
let i = 0;
export default {
  name: "ScratchCard",
  props: {
    // 水印文字
    watermark: {
      type: String,
      default: "刮一刮",
    },
    // 覆盖层颜色
    coverColor: {
      type: String,
      default: "#cccccc",
    },
  },
  data() {
    i++;
    return {
      isOpen: false,
      // 用于触发 renderjs 重绘的配置对象
      canvasConfig: {
        watermark: "",
        coverColor: "",
      },
      isScratched: false,
      isNeedScratch: true,
      isNeedTutorial: true, //uni.getStorageSync("scratchTutorial") === false,

      id: i,
    };
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // 打开时，重置 canvas 配置以触发 renderjs 重绘
        this.canvasConfig.resetFlag += 1;
      }
    },
  },
  methods: {
    // 防止触摸穿透或默认行为
    preventDefault() {},
    closeTutorial() {
      this.isNeedTutorial = false;
      uni.setStorageSync("scratchTutorial", false);
    },

    onScratchProgress(percent) {
      console.log(percent);
      this.$emit("progress", percent);
      if (percent >= 100 && !this.isScratched) {
        // 当刮开超过 40% 时，可选自动全部揭开或触发事件
        this.isScratched = true;
        this.$emit("finish");
      }
    },
  },
  created() {
    // 初始化 canvas 配置
    this.$nextTick(() => {
      this.isOpen = true;
    });
  },
};
</script>

<!-- 核心：renderjs 运行在视图层，直接操作 DOM -->
<script module="scratch" lang="renderjs">
export default {
  data() {
    return {};
  },
  methods: {
initScratchCard(newVal,oldVal) {

    if(!newVal.isOpen || newVal.isNeedScratch === false){
      return
    }
    this.$ownerInstance.callMethod("onScratchProgress", 0)
    const self = this
    const scratchColor = "#cccccc";
    const watermarkText = "五七仔";
    const onComplete = this.onComplete;
    console.log(scratchColor, watermarkText, onComplete)
    console.log("开始初始化刮刮乐图层")
    var parentNode = document.getElementById(`scratchWrapper${newVal.id}`);
    let canvas = document.getElementById(`scratchCanvas${newVal.id}`);
    var width = parentNode.offsetWidth;
    var height = parentNode.offsetHeight;
    if (!canvas) {
      // 1. 创建 Canvas 元素
      canvas = document.createElement('canvas');
      canvas.id = `scratchCanvas${newVal.id}`
      parentNode.appendChild(canvas);
    }

    var ctx = canvas.getContext('2d');
    // 2. 设置 Canvas 样式，使其占满父节点并置顶



    canvas.width = width;
    canvas.height = height;
    canvas.style.position = 'absolute';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.zIndex = '10'; // 确保在最上层
    canvas.style.borderRadius = 'inherit'; // 继承父节点圆角
    canvas.style.cursor = 'pointer';
    canvas.style.display = 'block';
    // 处理高清屏模糊问题 (可选优化)
    // 只有 getImageData 需要注意。这里为了简化逻辑，我们在计算像素时还原比例。



// 3. 初始化绘制刮层
function drawLayer() {
    // 填充背景色
    ctx.fillStyle = scratchColor;
    ctx.fillRect(0, 0, width, height);

    // 绘制 45 度角水印文字
    ctx.save(); // 保存当前画布状态

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // 半透明白色文字
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 将画布原点移到中心，方便旋转
    ctx.translate(width / 2, height / 2);
    ctx.rotate(45 * Math.PI / 180); // 旋转 45 度

    // 计算需要多少行多少列才能覆盖整个画布
    var textWidth = ctx.measureText(watermarkText).width;
    var rowHeight = 40; // 行间距
    var colWidth = textWidth + 60; // 列间距

    // 计算对角线长度，确保旋转后能覆盖整个区域
    var diagonal = Math.sqrt(width * width + height * height);
    var rowCount = Math.ceil(diagonal / rowHeight);
    var colCount = Math.ceil(diagonal / colWidth);


    // 绘制多行多列的文字
    for (var i = -rowCount; i <= rowCount; i++) {
        for (var j = -colCount; j <= colCount; j++) {
            ctx.fillText(watermarkText, j * colWidth, i * rowHeight);
        }
    }

    ctx.restore(); // 恢复画布状态
}


            drawLayer();

            // 4. 事件处理变量
            var isDrawing = false;
            var isCompleted = false;

            // 获取坐标的通用函数
            function getPos(e) {
                var rect = canvas.getBoundingClientRect();
                var clientX, clientY;

                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }

            // 开始刮
            function startDraw(e) {
                if (isCompleted) return;
                if(e.target.className.indexOf('scratch-tutorial') > -1){
                  e.target.className = 'scratch-tutorial scratch-tutorial-hide'
                }
                if(e.target.parentNode.className.indexOf('scratch-tutorial') > -1){
                  e.target.parentNode.className = 'scratch-tutorial scratch-tutorial-hide'
                }
                isDrawing = true;
                var pos = getPos(e);
                scratch(pos.x, pos.y);
            }

            // 移动刮
            function moveDraw(e) {
                if (!isDrawing || isCompleted) return;
                e.preventDefault(); // 防止触摸滚动
                var pos = getPos(e);
                scratch(pos.x, pos.y);
            }

            // 结束刮
            function endDraw() {
                if (!isDrawing || isCompleted) return;
                isDrawing = false;
                checkComplete();
            }

            // 执行刮的动作 (橡皮擦效果)
            function scratch(x, y) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2); // 20 是笔触半径
                ctx.fill();
            }
            try {
              const scratchTutorialDom = document.getElementById(`scratchTutorial${newVal.id}`);

              scratchTutorialDom.addEventListener('mousedown', startDraw);
            scratchTutorialDom.addEventListener('mousemove', moveDraw);
            scratchTutorialDom.addEventListener('mouseup', endDraw);
            scratchTutorialDom.addEventListener('mouseleave', endDraw); // 鼠标移出也算结束

            scratchTutorialDom.addEventListener('touchstart', startDraw, { passive: false });
            scratchTutorialDom.addEventListener('touchmove', moveDraw, { passive: false });
            scratchTutorialDom.addEventListener('touchend', endDraw);
            } catch (error) {

            }
            // 5. 绑定事件 (兼容 PC 和 移动端)
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', moveDraw);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseleave', endDraw); // 鼠标移出也算结束

            canvas.addEventListener('touchstart', startDraw, { passive: false });
            canvas.addEventListener('touchmove', moveDraw, { passive: false });
            canvas.addEventListener('touchend', endDraw);

            // 6. 判定是否刮开
            function checkComplete() {
                // 获取像素数据
                // 注意：因为前面做了 dpr 缩放，这里获取ImageData 需要对应真实的 canvas 宽高
                var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                var pixels = imageData.data;
                var transparentCount = 0;
                var totalPixels = pixels.length / 4; // RGBA 四个通道

                // 遍历像素，检查 Alpha 通道 (每 4 个值的第 4 个)
                for (var i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] < 128) { // Alpha < 128 视为透明
                        transparentCount++;
                    }
                }

                var ratio = transparentCount / totalPixels;
                var threshold = 0.2; // 阈值：刮开超过 50% 算完成
                self.$ownerInstance.callMethod("onScratchProgress", ratio * 100)
                if (ratio > threshold) {
                    isCompleted = true;
                    // 可选：完全清除剩余涂层，体验更好
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.style.display = "none"
                    self.$ownerInstance.callMethod("onScratchProgress", 100)

                    // 可选：移除事件监听，防止继续操作
                    // removeEventListeners...
                }
            }
        }
  },
};
</script>

<style lang="scss">
.scratch-container {
  // position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // z-index: 999;
  // pointer-events: none; /* 默认不阻挡点击，打开时由 wrapper 接管 */
}

.scratch-wrapper {
  position: relative;
  // width: 620rpx;
  // height: 80%;
  // margin: auto;
  // pointer-events: auto;
  // transform-style: preserve-3d;
  // transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 初始状态：缩小且翻转 */
  // opacity: 0;
  // transform: scale(0.5) rotateY(90deg);

  // &.animate-open {
  //   opacity: 1;
  //   transform: scale(1) rotateY(0deg);
  // }

  // &.animate-close {
  //   opacity: 0;
  //   transform: scale(0.5) rotateY(90deg);
  //   pointer-events: none;
  // }
}

.scratch-content {
  // position: absolute;
  // top: 0;
  // left: 0;
  // width: 100%;
  // height: 100%;
  // background: #fff;
  // border-radius: 10px;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // overflow: hidden;
  // box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  // z-index: 1;
}

.scratch-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  border-radius: 10px;
  touch-action: none; /* 禁止默认触摸行为 */
}

.scratch-tutorial {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 99;

  &.scratch-tutorial-show {
    // background: rgba(0, 0, 0, 0.5);
  }

  &.scratch-tutorial-hide {
    * {
      display: none;
    }
  }
  .scratch-tutorial-text {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    text-align: center;
    background: rgba(0, 0, 0, 0.5);
    padding: 5rpx;
    margin-bottom: 10rpx;
  }
  .scratch-tutorial-icon {
    width: 100rpx;
    height: 100rpx;
    background: url("/static/image/fingers.png") no-repeat center center;
    background-size: contain;
    animation: moveLeftRight 1s ease-in-out infinite alternate;
  }
}

@keyframes moveLeftRight {
  from {
    transform: translateX(-120rpx);
  }
  to {
    transform: translateX(120rpx);
  }
}
</style>
