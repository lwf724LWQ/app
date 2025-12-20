<template>
  <view class="draw-line">
    <Popup ref="popup" @submit="popupSubmit" :type="type"></Popup>
    <view class="tools">
      <view class="" @click="back">
        <uni-icons type="left" size="20" :color="styleConfig.topBar.color"></uni-icons>
      </view>
      <view class="" @click="revoke">
        <uni-icons
          custom-prefix="iconfont"
          type="icon-chexiao"
          size="20"
          :color="styleConfig.topBar.color"
        ></uni-icons>
        <view class="">撤销</view>
      </view>
      <view class="" @click="trash">
        <uni-icons type="trash" size="25" :color="styleConfig.topBar.color"></uni-icons>
        <view class="">清除</view>
      </view>
      <view class="" @click="share">
        <uni-icons
          custom-prefix="iconfont"
          type="icon-fenxiang"
          size="20"
          :color="styleConfig.topBar.color"
        ></uni-icons>
        <view class="">分享</view>
      </view>
      <view class="" v-permission:storage="saveImage">
        <uni-icons
          custom-prefix="iconfont"
          type="icon-baocun"
          size="20"
          :color="styleConfig.topBar.color"
        ></uni-icons>
        <view class="">保存</view>
      </view>
      <view class="" @click="isSettingOpen = !isSettingOpen">
        <uni-icons type="settings" size="25" :color="styleConfig.topBar.color"></uni-icons>
        <view class="">设置</view>
      </view>
    </view>

    <scroll-view
      class="scroll-view"
      id="container"
      @scroll="scroll"
      :scroll-y="isScroll"
      :scroll-top="scrollInitTop"
      v-if="data.length !== 0"
      :data-theme="options.theme"
      @touchstart="gesture.gesturestart"
      @touchmove="gesture.gesturemove"
      @touchend="gesture.gestureend"
    >
      <view class="container">
        <canvas class="image-canvas" hidpi canvas-id="imageCanvas" id="imageCanvas"></canvas>

        <!-- 背景canvas -->
        <canvas class="bg-canvas" hidpi canvas-id="bgCanvas" id="bgCanvas"></canvas>
        <!-- 绘制图形 -->
        <canvas class="base-canvas" hidpi canvas-id="baseCanvas" id="baseCanvas"></canvas>
        <canvas class="paint-canvas" hidpi canvas-id="paintCanvas" id="paintCanvas"></canvas>
        <canvas class="content-canvas" hidpi canvas-id="contentCanvas" id="contentCanvas"></canvas>
        <canvas
          class="active-canvas"
          hidpi
          canvas-id="activeCanvas"
          id="activeCanvas"
          @touchstart="touchstart"
          @touchmove="touchmove"
          @touchend="touchend"
        ></canvas>
        <!-- 元素拖拽容器 -->
        <movable-area class="movable-area">
          <!-- 悬浮文字，top减去容器到顶部的距离（canvas top） -->
          <movable-view
            class="text"
            direction="all"
            v-for="(item, index) in textList"
            :key="index"
            @change="textPositionChange"
            @touchstart="textPositionStart(index)"
            :x="item.text.position.x"
            :y="item.text.position.y"
            :class="{ 'text-handle-show': index === textChangeIndex }"
            :style="{
              fontSize: item.style.fontSize + 'px',
              lineHeight: item.style.fontSize + 'px',
              borderColor: index === textChangeIndex ? item.style.color : '',
            }"
          >
            <view class="text-container" :style="textStyle(index)">
              <view class="text-content" :id="`text-${index}`">{{ item.text.content }}</view>
            </view>
            <view
              class="text-btn-left"
              :style="{ backgroundColor: item.style.color }"
              @click="changeTextSolid(item.index)"
            >
              透
            </view>
            <view
              class="text-btn-right"
              :style="{ backgroundColor: item.style.color }"
              @touchstart="textTouchstart"
              @touchmove.stop="textTouchmove($event, item.index)"
              @touchend="textTouchend($event, index)"
            >
              拉
            </view>
          </movable-view>
        </movable-area>
        <uni-icons
          custom-prefix="iconfont"
          type="icon-shizi"
          size="18"
          class="curve-handle"
          color="red"
          @touchstart="curveTouchstart"
          @touchmove="curveTouchmove"
          @touchend="curveTouchend"
          v-show="iscurveHandleShow"
        ></uni-icons>
        <!-- 悬浮文字输入框 -->
        <textarea
          class="text-input"
          focus
          auto-height
          v-if="isTextInputShow"
          v-model="textareaValue"
          :cursor="cursor"
        />
      </view>
    </scroll-view>

    <ColorSelect
      class="color-select"
      v-model:color="color"
      v-model:size="size"
      v-show="isColorSelectShow"
      @click="changeColor"
    ></ColorSelect>
    <ModeSelect
      class="mode-select"
      v-model="mode"
      v-show="isModeSelectShow"
      @click="changeMode"
      v-model:openSetting="isSettingOpen"
    ></ModeSelect>
    <view class="lock" @click="lock" v-show="isLockShow">
      <uni-icons
        custom-prefix="iconfont"
        type="icon-shangxiajiantou"
        size="30"
        color="#fff"
        v-if="isLock"
      ></uni-icons>
      <uni-icons type="locked-filled" size="30" color="#fff" v-else></uni-icons>
    </view>
    <!-- 设置 -->
    <Setting class="setting" v-model="isSettingOpen" :record="record"></Setting>

    <Share ref="shareNode" :getImageUrl="getImageUrl"></Share>

    <!-- 用户首次进入遮罩 -->
    <view class="mask" v-if="!options.isFirst && data.length">
      <view class="mask-top"></view>
      <view class="mask-bottom">
        <view class="mask-left">
          <uni-icons type="arrow-up" size="70" color="#fff"></uni-icons>
          <uni-icons
            class="finger"
            custom-prefix="iconfont"
            type="icon-map-finger-full"
            size="60"
            color="#fff"
          ></uni-icons>
          <uni-icons type="arrow-down" size="70" color="#fff"></uni-icons>
        </view>

        <view class="mask-right">
          <view class="mask-right-text">上下滚动</view>
        </view>
      </view>

      <view class="mask-button" @click="drawLineSettingStore.changeIsFirst()">知道了</view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, computed, watch } from "vue";
import { onLoad, onReady, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { getCurrentInstance } from "vue";
import Popup from "@/components/juWang/Popup.vue";
import ColorSelect from "@/components/juWang/ColorSelect.vue";
import ModeSelect from "@/components/juWang/ModeSelect.vue";
import { DrawShape } from "./drawMethod";
import Setting from "@/components/juWang/Setting.vue";
import { useDrawLineSettingStore } from "@/stores/drawLine.js";
import { getCurvePoint } from "./utils";
import { apiTicketQuery } from "@/api/apis.js";
import Share from "@/components/juWang/Share.vue";
import { Draw } from "./cnavasMethod";
import { getPointPosition } from "./cnavasMethod";

const instance = getCurrentInstance();
const getSelectorQuery = () => uni.createSelectorQuery().in(instance.proxy);
const popup = ref(null);

const systemInfo = uni.getSystemInfoSync();
let ratio = systemInfo.screenWidth / 750;
const TOP_BAR_HEIGHT = 130 * ratio;

const safeArea = systemInfo.safeAreaInsets; // 安全距离

// 获取胶囊按钮高度
let menuButtonInfo = 0;
// #ifdef MP
menuButtonInfo = uni.getMenuButtonBoundingClientRect().top;
// #endif

const windowHeight = systemInfo.windowHeight;

const scrollInitTop = ref(0); // 滚动条初始位置

// 设置
const drawLineSettingStore = useDrawLineSettingStore();
const options = drawLineSettingStore.options;
const isSettingOpen = ref(false);

watch(
  () => options.showPeriod,
  async () => {
    await getData();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 34));
    draw.redraw();
    iscurveHandleShow.value = false;
  }
);
// 设置屏幕常亮
// #ifdef APP || MP
watch(
  () => options.keepScreenOn,
  () => {
    if (options.keepScreenOn) {
      uni.setKeepScreenOn({
        keepScreenOn: true,
      });
    } else {
      uni.setKeepScreenOn({
        keepScreenOn: false,
      });
    }
  }
);
// #endif
watch(
  () => options.bottomRow,
  async (newVal) => {
    if (newVal === 6) {
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 17));
      draw.redraw(record.value, pointActives.value);
    }
  }
);
// 页面数据
const data = ref([]);
const getData = async () => {
  try {
    uni.showLoading({ title: "加载中..." });
    const res = await apiTicketQuery({
      tname: type.value,
      page: "1",
      limit: options.showPeriod || 40,
    });

    data.value = res.data.records.reverse();
    data.value.forEach((item) => {
      item.number = item.number?.split(" ");
      if (type.value === "七星彩") item.number.push(item.refernumber);
    });
  } finally {
    uni.hideLoading();
  }
};

const curveHandleX = ref(0);
const curveHandleY = ref(0);

const iscurveHandleShow = ref(false);

const color = ref("#f2232b");
const size = ref(3);

// 监听触摸事件
const record = ref([]); // [{point:[12,34] , line:{type:straight/curve,position:{}} , mark:{} , style:{color,size}} , text:'']
let startX, startY;

let isClick = true;
// 临时数据
let startPosition = { x: 0, y: 0 };
let track = []; // 轨迹
let textPosition = {}; // 文字位置

const isTextInputShow = ref(false);
const textareaPosition = ref({}); // textarea坐标
const textareaValue = ref("");
let tmpStartPositions = []; // 保存多个临时位置
let isGesture = false; // 是否是手势操作

const touchstart = (event) => {
  if (Object.keys(event.touches).length >= 2 && options.theme === "其他") {
    gesturestart(event);
    isGesture = true;
    return;
  } else {
    isGesture = false;
  }

  if (isLock.value) {
    isScroll.value = true;
    return;
  }
  // 关闭悬浮文字激活
  if (textChangeIndex.value !== null && !isTextInputShow.value) textChangeIndex.value = null;
  //禁用曲线控制按钮
  iscurveHandleShow.value = false;

  let { x, y } = event.touches[0];
  x = x / scale.value;
  y = y / scale.value;
  startX = x;
  startY = y;

  // 判断是否是滚动页面
  const column1Width = styleConfig.value.columns[styleConfig.value.numberStartIndex].left;
  if (x < column1Width) {
    isScroll.value = true;
    return;
  } else {
    isScroll.value = false;
  }

  event.preventDefault();

  switch (mode.value) {
    case "智能曲线":
      startPosition = getPointPosition(x, y);
      break;
    case "自由线":
      startPosition = getPointPosition(x, y);
      track = [{ x, y }];
      break;
    case "直线":
      startPosition = { x, y };
      break;
    case "添加文字":
      break;
    case "实心方框":
    case "空心方框":
      startPosition = { x, y };
      break;
    case "实心圆框":
    case "空心圆框":
      startPosition = { x, y };
      break;
  }
};
const colors = [
  "#f2232b",
  "#2f54eb",
  "#fa531c",
  "#13c2c2",
  "#fa8b15",
  "#1791ff",
  "#faad17",
  "#53c41a",
  "#fbdb16",
  "#722ed1",
  "#a0d911",
  "#ec2f96",
  "#bfbfbf",
  "#252628",
  "#795547",
  "#607d8b",
];
let isFirst = true;

const touchmove = (event) => {
  if (isGesture) {
    gesturemove(event);
    event.preventDefault();
    return;
  }

  if (isScroll.value) {
    return;
  } else {
    event.preventDefault();
  }

  let { x, y } = event.touches[0];
  x = x / scale.value;
  y = y / scale.value;

  isClick = false;
  // 判断是否是点击
  if (Math.abs(startX - x) < 10 * ratio && Math.abs(startY - y) < 10 * ratio) {
    isClick = true;
    return;
  }

  switch (mode.value) {
    case "智能曲线":
      // 只执行一次
      if (isFirst) {
        if (options.count === 1) {
          record.value.push({
            point: pointActives.value[`${startPosition.row}-${startPosition.column}`]
              ? []
              : [startPosition],
            style: { color: color.value, size: size.value, ...options.numberStyle },
          });
        } else {
          for (let index = 0; index < options.count; index++) {
            tmpStartPositions.push({
              x: startPosition.x,
              y: startPosition.y - options.rowHeight * ratio * index * (options.distance + 1),
              row: startPosition.row - index * (options.distance + 1),
              column: startPosition.column,
            });
          }

          const recordList = [];
          const colorStartIndex = colors.indexOf(color.value);
          for (let index = 0; index < options.count; index++) {
            if (
              !pointActives.value[
                `${tmpStartPositions[index].row}-${tmpStartPositions[index].column}`
              ]
            ) {
              recordList.push({
                point: [tmpStartPositions[index]],
                style: {
                  color:
                    options.colorType === "single" ? color.value : colors[colorStartIndex + index],
                  size: size.value,
                  ...options.numberStyle,
                },
              });
            }
          }
          record.value.push(recordList);
        }
      }
      isFirst = false;

      // 绘制连线
      if (options.count === 1) {
        drawMethod.drawnStraightLine(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          x,
          y - scrolltop / scale.value,
          color.value,
          size.value
        );
      } else {
        let c = color.value;
        const colorStartIndex = colors.indexOf(c);

        tmpStartPositions.forEach((item, index) => {
          if (options.colorType !== "single") {
            c = colors[colorStartIndex + index];
          }
          const endY = y - options.rowHeight * ratio * index * (options.distance + 1);
          drawMethod.drawnStraightLine(
            item.x,
            item.y - scrolltop / scale.value,
            x,
            endY - scrolltop / scale.value,
            c,
            size.value
          );
        });
      }
      drawMethod.draw();
      break;
    case "自由线":
      const startX = track[track.length - 1].x;
      const startY = track[track.length - 1].y - scrolltop / scale.value;
      drawMethod.drawnStraightLine(
        startX,
        startY,
        x,
        y - scrolltop / scale.value,
        color.value,
        size.value
      );
      track.push({ x, y });
      drawMethod.draw(true);
      break;
    case "直线":
      drawMethod.drawnStraightLine(
        startPosition.x,
        startPosition.y - scrolltop / scale.value,
        x,
        y - scrolltop / scale.value,
        color.value,
        size.value
      );
      drawMethod.draw();
      break;
    case "添加文字":
      break;
    case "实心方框":
    case "空心方框":
      const width = x - startPosition.x;
      const height = y - startPosition.y;
      if (mode.value === "实心方框") {
        drawMethod.drawSolidRect(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          width,
          height,
          color.value
        );
      } else {
        drawMethod.drawHollowRect(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          width,
          height,
          color.value,
          size.value
        );
      }
      drawMethod.draw();
      break;
    case "实心圆框":
    case "空心圆框":
      if (mode.value === "实心圆框") {
        drawMethod.drawSolidCircle(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          x,
          y - scrolltop / scale.value,
          color.value
        );
      } else {
        drawMethod.drawHollowCircle(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          x,
          y - scrolltop / scale.value,
          color.value,
          size.value
        );
      }
      drawMethod.draw();
      break;
  }
};

const touchend = async (event) => {
  if (isGesture) {
    gestureend(event);
    return;
  }

  if (isScroll.value) return;

  let { x, y } = event.changedTouches[0];
  x = x / scale.value;
  y = y / scale.value;

  // 判断是否点击
  if (isClick) {
    // 添加文字
    if (mode.value === "添加文字") {
      if (!isTextInputShow.value) {
        // 弹出输入框
        if (textChangeIndex.value !== null) {
          textChangeIndex.value = null;
          return;
        }
        textPosition = { x, y };
        textareaPosition.value = { x, y };
        isTextInputShow.value = true;
      } else {
        isTextInputShow.value = false;
        // 修改文字
        if (textChangeIndex.value !== null) {
          const index = textList.value[textChangeIndex.value].index;
          const meta = record.value[index];

          meta.text.content = textareaValue.value;
          // 重新计算文字框大小
          meta.style.width = "auto";
          meta.style.height = "auto";
          nextTick(async () => {
            const { width, height } = await getRect(`#text-${textChangeIndex.value}`);
            meta.text.width = (width + 15 * ratio * 2) / scale.value;
            meta.text.height = (height + 5 * ratio * 2) / scale.value;
            textChangeIndex.value = null;
            textareaValue.value = "";
          });

          return;
        }

        // 添加文字
        if (!textareaValue.value) return;
        record.value.push({
          text: {
            content: textareaValue.value,
            position: textPosition,
          },
          style: {
            color: color.value,
            fontSize: 20,
          },
          isSolid: true,
        });
        textareaValue.value = "";
        nextTick(async () => {
          const { width, height } = await getRect(`#text-${textList.value.length - 1}`);
          const item = record.value[record.value.length - 1];
          // 加上padding
          item.text.width = (width + 15 * ratio * 2) / scale.value;
          item.text.height = (height + 5 * ratio * 2) / scale.value;
        });
      }
    } else {
      const position = getPointPosition(startPosition.x, startPosition.y);
      if (position && position.x && position.column >= styleConfig.value.numberStartIndex) {
        if (
          marks.value[`${position.row}-all`] &&
          position.column >= styleConfig.value.numberStartIndex + 1 &&
          position.column <= styleConfig.value.numberStartIndex + 4
        ) {
          record.value.push({
            delete: { position: { row: position.row, column: "all" } },
          });
        } else if (
          pointActives.value[`${position.row}-${position.column}`] ||
          marks.value[`${position.row}-${position.column}`]
        ) {
          // 删除记录
          record.value.push({
            delete: { position },
          });
        } else {
          record.value.push({
            point: [position],
            style: { color: color.value, ...options.numberStyle },
          });
          openPopup(position.row, position.column);
        }
      }
    }
  } else {
    switch (mode.value) {
      case "智能曲线":
        const lastRecord = record.value[record.value.length - 1];

        let endPosition;

        const addRecord = (record, startPosition, endPosition) => {
          // 如果最后位置不是开始位置，则添加当前点
          if (
            startPosition.row !== endPosition.row ||
            startPosition.column !== endPosition.column
          ) {
            record.point.push(endPosition);
            if (options.lineType === "straight") {
              record.line = {
                type: "straight",
                position: {
                  startX: startPosition.x,
                  startY: startPosition.y,
                  endX: endPosition.x,
                  endY: endPosition.y,
                },
              };
            } else {
              const [upPoint, downPoint, upOffset, downOffset] = getCurvePoint(
                startPosition.x,
                startPosition.y,
                endPosition.x,
                endPosition.y,
                50 * ratio
              );
              if (options.lineType === "curveUp") {
                nextTick(() => {
                  curveHandleX.value = upPoint.x;
                  curveHandleY.value = upPoint.y - scrolltop;
                });

                record.line = {
                  type: "curve",
                  position: {
                    startX: startPosition.x,
                    startY: startPosition.y,
                    centerX: upOffset,
                    centerY: upPoint.y,
                    endX: endPosition.x,
                    endY: endPosition.y,
                  },
                };
              } else if (options.lineType === "curveDown") {
                nextTick(() => {
                  curveHandleX.value = downPoint.x;
                  curveHandleY.value = downPoint.y - scrolltop;
                });
                record.line = {
                  type: "curve",
                  position: {
                    startX: startPosition.x,
                    startY: startPosition.y,
                    centerX: downOffset,
                    centerY: downPoint.y,
                    endX: endPosition.x,
                    endY: endPosition.y,
                  },
                };
              }
            }
          }

          openPopup(endPosition.row, endPosition.column);
          // }
        };
        if (options.count === 1) {
          endPosition = getPointPosition(x, y);
          // endPosition.x有值：未超出视图，同时为数字列
          if (
            endPosition &&
            endPosition.x &&
            endPosition.column >= styleConfig.value.numberStartIndex
          ) {
            addRecord(lastRecord, startPosition, endPosition);
          }
        } else {
          for (let index = 0; index < lastRecord.length; index++) {
            const record = lastRecord[index];
            endPosition = getPointPosition(
              x,
              y - options.rowHeight * ratio * index * (options.distance + 1)
            );

            if (!endPosition.x || endPosition.column < styleConfig.value.numberStartIndex) continue;

            addRecord(record, tmpStartPositions[index], endPosition);
          }
        }
        // 是否显示曲线控制按钮
        if (
          (startPosition.x !== endPosition.x || startPosition.y !== endPosition.y) &&
          options.dragPoint &&
          options.count === 1 &&
          endPosition.x &&
          endPosition.column >= styleConfig.value.numberStartIndex
        ) {
          curveHandleX.value = startPosition.x / 2 + endPosition.x / 2;
          curveHandleY.value = startPosition.y / 2 + endPosition.y / 2;
          iscurveHandleShow.value = true;
        } else {
          iscurveHandleShow.value = false;
        }

        tmpStartPositions = [];
        drawMethod.draw();

        break;
      case "自由线":
        record.value.push({
          line: {
            type: "track",
            position: track,
          },
          style: { color: color.value, size: size.value },
        });
        // await draw.saveDraw()
        track = [];
        break;
      case "直线":
        record.value.push({
          line: {
            type: "straight",
            position: { startX: startPosition.x, startY: startPosition.y, endX: x, endY: y },
          },
          style: { color: color.value, size: size.value },
        });
        // await draw.saveDraw()
        startPosition = {};
        break;
      case "添加文字":
        break;
      case "实心方框":
        record.value.push({
          line: {
            type: "solidRect",
            position: {
              x: startPosition.x,
              y: startPosition.y,
              width: x - startPosition.x,
              height: y - startPosition.y,
            },
          },
          style: { color: color.value },
        });
        // await draw.saveDraw()
        startPosition = {};
        break;
      case "空心方框":
        record.value.push({
          line: {
            type: "hollowRect",
            position: {
              x: startPosition.x,
              y: startPosition.y,
              width: x - startPosition.x,
              height: y - startPosition.y,
            },
          },
          style: { color: color.value, size: size.value },
        });
        // await draw.saveDraw()
        startPosition = {};
        break;
      case "实心圆框":
        record.value.push({
          line: {
            type: "solidCircle",
            position: { startX: startPosition.x, startY: startPosition.y, endX: x, endY: y },
          },
          style: { color: color.value, size: size.value },
        });
        // await draw.saveDraw()
        startPosition = {};
        break;
      case "空心圆框":
        record.value.push({
          line: {
            type: "hollowCircle",
            position: { startX: startPosition.x, startY: startPosition.y, endX: x, endY: y },
          },
          style: { color: color.value, size: size.value },
        });
        // await draw.saveDraw()
        startPosition = {};
        break;
    }
  }

  isClick = true;
  isFirst = true;
};

// 手势缩放
const scale = ref(1);
const gestureStartCenterY = ref(0); // 手势操作开始中心位置
const initHeight = computed(() => (data.value.length + options.bottomRow) * options.rowHeight);
const containerHeight = ref(0);

const gesturestart = async (event) => {
  //禁用曲线控制按钮
  iscurveHandleShow.value = false;
  containerHeight.value = initHeight.value;

  const { 0: touch1, 1: touch2 } = event.touches;
  const y = (touch1.y + touch2.y) / 2;

  isScroll.value = true; // 开启滚动
  await nextTick();
  scrollInitTop.value = y / scale.value - (y - scrolltop);

  gestureStartCenterY.value = y / scale.value;
};

const gesturemove = (event) => {
  isScroll.value = false; // 关闭滚动
};

const cnavasWidth = ref(750);
// const cnavasWidth = ref(750 / 0.8)

const gestureend = async (event) => {};

const updateScale = async (value) => {
  scale.value = value;

  cnavasWidth.value = 750 / scale.value;

  isScroll.value = true; // 开启滚动
  await nextTick();
  scrollInitTop.value =
    gestureStartCenterY.value * scale.value - (gestureStartCenterY.value - scrolltop);

  // 删除容器多余的高度
  let bottom = initHeight.value - gestureStartCenterY.value / ratio;
  if (bottom > windowHeight / ratio) bottom = windowHeight / ratio;
  const height = bottom + (gestureStartCenterY.value / ratio) * scale.value;
  containerHeight.value = height;

  gestureStartCenterY.value = 0;
};

watch(
  record,
  () => {
    drawnLineAll(record.value, pointActives.value);
    drawMethod.draw();
  },
  {
    deep: true,
  }
);
watch(
  () => options.theme,
  async (newVal, oldVal) => {
    if (newVal === "其他" || oldVal === "其他") record.value.splice(0, record.value.length);
    if (newVal !== "其他") scale.value = 1;
    styleConfig.value = drawLineSettingStore.styleConfig;

    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 17));
    draw.redraw(record.value, pointActives.value);
    iscurveHandleShow.value = false;
    scrollTopRef.value = 0;
  }
);
watch([() => options.fontFamily, () => options.fontSizeRatio], () => {
  draw.drawAllText(pointActives.value);
});

const openPopup = (row, column) => {
  // 结束位置为空白区域，同时为数字列、结束位置没有标记、允许数字选择器、允许的样式主题
  if (
    row > data.value.length - 1 &&
    column >= styleConfig.value.numberStartIndex &&
    !marks.value[`${row}-${column}`] &&
    !(
      marks.value[`${row}-all`] &&
      column >= styleConfig.value.numberStartIndex + 1 &&
      column <= styleConfig.value.numberStartIndex + 4
    ) &&
    options.numberPicker &&
    options.theme !== "其他"
  ) {
    let item = record.value[record.value.length - 1];
    if (Array.isArray(item)) item = item[0];

    popup.value.open(column);
  }
};

// 修改曲线
let curvePosition;
const curveTouchstart = () => {
  const { startX, startY, endX, endY } = record.value[record.value.length - 1].line.position;

  curvePosition = {
    startX,
    startY,
    centerX: startX / 2 + endX / 2,
    centerY: startY / 2 + endY / 2,
    endX,
    endY,
  };
};
const curveTouchmove = (event) => {
  event.preventDefault();
  const { pageX, pageY } = event.touches[0];

  const { startX, startY, centerX, centerY, endX, endY } = curvePosition;
  curveHandleY.value = (pageY - TOP_BAR_HEIGHT + scrolltop - safeArea.top) / scale.value;
  curveHandleX.value = pageX / scale.value;
  const y = (curveHandleY.value - centerY) * 2 + centerY;
  const x = (curveHandleX.value - centerX) * 2 + centerX;
  drawMethod.drawnCurveLine(
    startX,
    startY - scrolltop / scale.value,
    x,
    y - scrolltop / scale.value,
    endX,
    endY - scrolltop / scale.value,
    color.value,
    size.value
  );
  drawMethod.draw();
  if (isFirst) {
    record.value[record.value.length - 1].line = {};
    isFirst = false;
  }
};
const curveTouchend = () => {
  const { startX, startY, centerX, centerY, endX, endY } = curvePosition;
  const y = (curveHandleY.value - centerY) * 2 + centerY;
  const x = (curveHandleX.value - centerX) * 2 + centerX;

  const line = record.value[record.value.length - 1].line;
  line.type = "curve";
  line.position = { startX, startY, centerX: x, centerY: y, endX, endY };
  isFirst = true;
};

// 激活列表
const pointActives = computed(() => {
  const deletes = [];
  record.value.forEach((item) => {
    if (item.delete) {
      deletes.push(`${item.delete.position.row}-${item.delete.position.column}`);
    }
  });

  const result = {};
  const addResult = (item) => {
    if (!item?.point) return;
    item.point.forEach(({ row, column }) => {
      if (deletes.includes(`${row}-${column}`)) {
        deletes.splice(deletes.indexOf(`${row}-${column}`), 1);
        return;
      }

      result[`${row}-${column}`] = item.style;
    });
  };
  record.value.forEach((item) => {
    if (Array.isArray(item) && item.length > 0) {
      item.forEach((item) => {
        addResult(item);
      });
    } else {
      addResult(item);
    }
  });
  return result;
});

const back = () => {
  uni.navigateBack();
};
// 撤销
const revoke = () => {
  iscurveHandleShow.value = false;
  record.value.pop();
};
// 清除
const trash = () => {
  if (record.value.length !== 0) {
    uni.showModal({
      title: "提示",
      content: "确定要清空吗？",
      success: (res) => {
        if (res.confirm) {
          iscurveHandleShow.value = false;
          record.value.splice(0, record.value.length);
        }
      },
    });
  } else {
    iscurveHandleShow.value = false;
    record.value.splice(0, record.value.length);
  }
};

// 保存图片
const saveImage = async () => {
  uni.showLoading({ title: "保存中" });
  await new Promise((resolve) => setTimeout(resolve, 100));
  let url;
  try {
    url = await draw.save(scrolltop / scale.value);
  } finally {
    uni.hideLoading();
  }
  // #ifdef H5
  const a = document.createElement("a");
  a.href = url;
  a.download = "canvas.png";
  a.click();
  uni.showToast({
    title: "保存成功",
  });
  // #endif
  // #ifdef APP || MP
  uni.saveImageToPhotosAlbum({
    filePath: url,
    success: (res) => {
      uni.showToast({
        title: "保存成功",
      });
    },
    fail: (err) => {
      uni.showToast({
        title: "保存失败",
        icon: "error",
      });
    },
  });
  // #endif
};
// 分享
const shareNode = ref();
const getImageUrl = ref(null);
const share = async () => {
  // #ifdef H5
  await navigator.clipboard.writeText(window.location.href);
  uni.showToast({ title: "复制链接成功" });
  // #endif
  // #ifdef APP
  shareNode.value.open();
  getImageUrl.value = draw.save(scrolltop / scale.value);
  // #endif
  // #ifdef MP
  shareNode.value.open();
  // #endif
};
// 获取元素位置信息
const getRect = (id) => {
  return new Promise((resolve) => {
    const query = getSelectorQuery();
    query
      .select(id)
      .boundingClientRect((data) => {
        resolve(data);
      })
      .exec();
  });
};
// #ifdef MP
onShareAppMessage((from, target, webViewUrl) => {
  return {
    title: "分享",
    path: "/pages/juWang/peng-liao/drawLine/drawLine.vue?type=" + type.value,
  };
});
onShareTimeline(() => {
  return {
    title: "分享",
    path: "/pages/juWang/peng-liao/drawLine/drawLine.vue?type=" + type.value,
  };
});
// #endif

const type = ref("");
onLoad(async (options) => {
  type.value = options.type;
});
let draw;
let drawnLineAll;
let drawMethod;
const styleConfig = ref({ topBar: {} });
onReady(async () => {
  drawLineSettingStore.setStyleConfig(type.value, options.theme);
  styleConfig.value = drawLineSettingStore.styleConfig;

  const bgCtx = uni.createCanvasContext("bgCanvas");
  const baseCtx = uni.createCanvasContext("baseCanvas");
  const paintCtx = uni.createCanvasContext("paintCanvas");
  const contentCtx = uni.createCanvasContext("contentCanvas");
  const activeCtx = uni.createCanvasContext("activeCanvas");
  const imageCtx = uni.createCanvasContext("imageCanvas");
  drawMethod = new DrawShape(paintCtx);
  await getData();
  const canvasSize = await getRect("#bgCanvas"); // canvas 尺寸

  draw = new Draw(
    bgCtx,
    baseCtx,
    paintCtx,
    contentCtx,
    activeCtx,
    imageCtx,
    data,
    options,
    canvasSize,
    marks
  );

  drawnLineAll = draw.draw.bind(draw);
  drawnLineAll(record.value);
  // 滚动到底部
  scrollInitTop.value = 9999;
  await nextTick();
  isScroll.value = false;
});

// 标记列表
const marks = computed(() => {
  const deletes = [];
  record.value.forEach((item) => {
    if (item.delete) {
      deletes.push(`${item.delete.position.row}-${item.delete.position.column}`);
    }
  });

  const result = {};
  const getMarks = (item) => {
    const row = item.mark?.row;
    const indexs = item.mark?.indexs;
    if (row && indexs) {
      if (item.mark.condition === "稳码") {
        if (deletes.includes(`${row}-all`)) {
          deletes.splice(deletes.indexOf(`${row}-all`), 1);
          return;
        }
        result[`${row}-all`] = { mark: item.mark, style: item.style };
        return;
      }

      indexs.forEach((index) => {
        if (deletes.includes(`${row}-${index}`)) {
          deletes.splice(deletes.indexOf(`${row}-${index}`), 1);
          return;
        }
        result[`${row}-${index}`] = { mark: item.mark, style: item.style };
      });
    }
  };
  record.value.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach(getMarks);
    } else {
      getMarks(item);
    }
  });
  return result;
});
const popupSubmit = (val) => {
  let item = record.value[record.value.length - 1];
  if (Array.isArray(item)) item = item[0];
  item.mark = val;
  item.mark.row = item.point[item.point.length - 1].row;
  item.point.pop();
};

// 滚动高度
let scrolltop = 0;
const isScroll = ref(true);
const scrollTopRef = ref(0);
let timer;
const scroll = (event) => {
  scrolltop = event.detail.scrollTop;

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    scrollTopRef.value = scrolltop;
  }, 100);
};

// 绘制图形
const mode = ref("智能曲线");

const textList = computed(() => {
  const result = [];
  for (let i = 0; i < record.value.length; i++) {
    const item = record.value[i];
    if (Array.isArray(item)) continue;
    if (item.text) {
      result.push({ text: item.text, style: item.style, isSolid: item.isSolid, index: i });
    }
  }
  return result;
});

const textStyle = (index) => {
  const meta = textList.value[index];

  return {
    backgroundColor: meta.isSolid ? meta.style.color : "transparent",
    color: meta.isSolid ? "#fff" : meta.style.color,
    width: textList.value[index].text.width + "px",
    height: textList.value[index].text.height + "px",
    borderColor: meta.style.color,
  };
};

// 悬浮文字框
let textStartX, textStartY;
let tmpTextWidth, tmpTextHeight;

const changeTextFontSize = (index) => {
  const item = record.value[index];
  const contentLength = item.text.content.length;

  let row = 1;
  while (true) {
    const fs = item.text.height / row;
    const cloumn = Math.floor(item.text.width / (fs * 0.6));
    if (row * cloumn >= contentLength) {
      if (fs > 80) {
        item.style.fontSize = 80;
        return;
      } else {
        item.style.fontSize = fs;
        return;
      }
    }
    row++;
    if (row > 10) return;
  }
};

const textTouchstart = (e) => {
  isScroll.value = false;
  const { pageX, pageY } = e.touches[0];

  textStartX = pageX;
  textStartY = pageY;
  const { width, height } = textList.value[textList.value.length - 1].text;

  tmpTextWidth = width;
  tmpTextHeight = height;
};

const textTouchmove = (e, index) => {
  e.preventDefault();
  const { pageX, pageY } = e.touches[0];

  const changeWidth = pageX - textStartX;
  const changeHeight = pageY - textStartY;

  const item = record.value[index];

  if (item.text.fontSize < 20 && (changeWidth < 0 || changeHeight < 0)) return;
  item.text.width = changeWidth + tmpTextWidth;
  item.text.height = changeHeight + tmpTextHeight;

  changeTextFontSize(index);
};
const textTouchend = async (e, index) => {
  const i = textList.value[index].index;
  const item = record.value[i];

  const { width, height } = await getRect(`#text-${index}`);
  item.text.width = (width + 15 * ratio * 2) / scale.value;
  item.text.height = (height + 5 * ratio * 2) / scale.value;

  isTextClick = true;
};

const changeTextSolid = (index) => {
  record.value[index].isSolid = !record.value[index].isSolid;
};

// 更新文字位置
let textPositionChangeTimer;
const textPositionChange = (e) => {
  textPositionChangeTimer && clearTimeout(textPositionChangeTimer);
  textPositionChangeTimer = setTimeout(() => {
    const { x, y } = e.detail;

    const item = record.value[textList.value[textChangeIndex.value].index];
    item.text.position.x = x;
    item.text.position.y = y;
  }, 100);
};

const textPositionStart = (index) => {
  textChangeIndex.value = index;
};

let textChangeIndex = ref(null);
const cursor = ref(0);

// 锁定页面
const isModeSelectShow = ref(true);
const isColorSelectShow = ref(true);
const isLockShow = ref(true);

const isLock = ref(false);
const lock = () => {
  isLock.value = !isLock.value;
  isModeSelectShow.value = !isLock.value;
  isColorSelectShow.value = !isLock.value;
};
const changeColor = () => {
  isModeSelectShow.value = !isModeSelectShow.value;
  isLockShow.value = !isLockShow.value;
};
const changeMode = () => {
  isColorSelectShow.value = !isColorSelectShow.value;
  isLockShow.value = !isLockShow.value;
};
</script>

<script>
// renderjs中只能调用选项式api,创建一个选项式api的script进行中转
export default {
  methods: {
    _updateScale(value) {
      this.$.setupState.updateScale(value);
    },
  },
};
</script>
<script lang="renderjs" module="gesture">
let scale = 1, tmpScale, gestureStartDistance, theme, isGesture = false
export default {
  methods: {
    gesturestart(event){
      const _theme = event.currentTarget.dataset.theme

      const { 0: touch1, 1: touch2 } = event.touches

      if( !touch1 || !touch2 || _theme !== '其他') {
        isGesture = false
        return
      }
      else {
        theme = _theme
        isGesture = true
      }

      gestureStartDistance = Math.sqrt((touch1.pageX - touch2.pageX) ** 2 + (touch1.pageY - touch2.pageY) ** 2)
      tmpScale = scale
    },
    gesturemove(event) {
      if(!isGesture) return

      const { 0: end1, 1: end2 } = event.touches
      if(!end1 || !end2) return


      const gestureEndDistance = Math.sqrt(Math.pow(end1.pageX - end2.pageX, 2) + Math.pow(end1.pageY - end2.pageY, 2))
      const _scale = (gestureEndDistance / gestureStartDistance) * tmpScale
      if (_scale < 0.6 || _scale > 2) return
      scale = _scale
      document.querySelector('.container').style.transform = `scale(${scale})`
    },
    gestureend(event){
      if(!isGesture || event.touches.length > 0) return

      this.$ownerInstance.callMethod('_updateScale', scale)
    }
  },
}
</script>

<style lang="scss" scoped>
@use "sass:math";
/* #ifdef MP || APP*/
page {
  background-color: v-bind("styleConfig.topBar?.backgroundColor");
}
.draw-line {
  background-color: v-bind("styleConfig.topBar?.backgroundColor");
}
.scroll-view {
  background-color: #fff;
}
/* #endif */

.draw-line {
  view {
    box-sizing: border-box;
  }
  /* #ifdef H5 */
  height: v-bind('windowHeight + "px"');
  /* #endif */
  /* #ifdef APP */
  height: v-bind('windowHeight - safeArea.top + "px"');
  /* #endif */
  /* #ifdef MP */
  height: v-bind('windowHeight - safeArea.top - menuButtonInfo + "px"');
  /* #endif */

  /* #ifdef APP */
  padding-top: v-bind('safeArea.top + "px"');
  /* #endif */
  /* #ifdef MP */
  padding-top: v-bind('safeArea.top + menuButtonInfo + "px"');
  /* #endif */
  position: relative;
  %btn-base {
    position: fixed;
    bottom: 30rpx;
    z-index: 10;
    bottom: calc(30rpx + v-bind('safeArea.bottom + "px"'));
  }
  .color-select {
    @extend %btn-base;
    left: 30rpx;
  }
  .mode-select {
    @extend %btn-base;
    right: 0;
  }
  .lock {
    @extend %btn-base;
    left: 50%;
    transform: translateX(-50%);
    padding: 10rpx;
    background-color: rgba($color: #000000, $alpha: 0.6);
    border-radius: 50%;
  }
  .setting {
    position: fixed;
    bottom: 0;
    z-index: 99;
  }
}
.scroll-view {
  height: calc(100% - v-bind('TOP_BAR_HEIGHT + "px"'));
  .container {
    position: relative;
    height: v-bind('containerHeight + "rpx"');
    transform-origin: 0 v-bind('gestureStartCenterY + "px"');

    .bg-canvas,
    .base-canvas,
    .paint-canvas,
    .content-canvas,
    .active-canvas,
    .movable-area {
      width: 100vw;
      height: v-bind('(data.length + options.bottomRow) * options.rowHeight + "rpx"');
      /* #ifdef APP */
      top: calc(-130rpx - v-bind('safeArea.top + "px"'));
      /* #endif */
      /* #ifdef MP */
      top: calc(-130rpx - v-bind('safeArea.top + menuButtonInfo + "px"'));
      /* #endif */
      z-index: 2;
      position: absolute;
      top: 0;
    }
    .paint-canvas,
    .base-canvas,
    .active-canvas {
      width: v-bind('cnavasWidth + "rpx"');
    }
    .paint-canvas {
      // 动态计算top值，保证画布在可视区域
      top: calc(v-bind('(scrollTopRef) / scale + "px"'));
      /* #ifdef H5 */
      height: calc((v-bind('windowHeight - TOP_BAR_HEIGHT + "px"')) / v-bind("scale"));
      /* #endif */
      /* #ifdef APP */
      height: calc(
        (v-bind('windowHeight - TOP_BAR_HEIGHT - safeArea.top + "px"')) / v-bind("scale")
      );
      /* #endif */
      /* #ifdef MP */
      height: calc(
        (v-bind('windowHeight - safeArea.top - menuButtonInfo - TOP_BAR_HEIGHT + "px"')) /
          v-bind("scale")
      );
      /* #endif */
    }
    .image-canvas {
      visibility: hidden;
      width: 100vw;
      height: v-bind('(data.length + options.bottomRow) * options.rowHeight + "rpx"');
      transform: scale(0.1); // 0.1随便写，足够小即可
    }
    .movable-area {
      pointer-events: none;
    }

    .curve-handle {
      position: absolute;
      width: 35rpx;
      height: 35rpx;
      z-index: 4;
      top: v-bind('curveHandleY + "px"');
      left: v-bind('curveHandleX + "px"');
      text-align: center;
      transform: translate(-50%, -50%);
      pointer-events: v-bind('isLock ? "none" : "auto"');
    }

    .text {
      width: auto;
      height: auto;
      padding: 9rpx;
      border: 2px solid transparent;
      border-radius: 5rpx;
      z-index: 5;
      pointer-events: auto;
      .text-container {
        padding: 5rpx 15rpx;
        border-radius: 10rpx;
        // .text-item {
        .text-content {
          display: inline-block;
          word-break: break-all;
          vertical-align: top;
        }
        // }
      }
      $text-font-size: 25rpx;
      .text-btn-left,
      .text-btn-right {
        display: none;
        position: absolute;
        width: 35rpx;
        height: 35rpx;
        // bottom: -$text-font-size / 2 - 2rpx - 5rpx;
        bottom: math.div(-$text-font-size, 2) - 2rpx - 5rpx;
        font-size: $text-font-size;
        line-height: 35rpx;
        border-radius: 50%;
        background-color: v-bind(color);
        color: #fff;
        text-align: center;
      }
      .text-btn-left {
        // left: -$text-font-size / 2 - 2rpx - 5rpx;
        left: math.div(-$text-font-size, 2) - 2rpx - 5rpx;
      }
      .text-btn-right {
        // right: -$text-font-size / 2 - 2rpx - 5rpx;
        right: math.div(-$text-font-size, 2) - 2rpx - 5rpx;
      }
    }
    .text-input {
      border: 5rpx solid #f89121;
      width: 300rpx;
      position: absolute;
      z-index: 5;
      left: v-bind('textareaPosition.x + "px"');
      top: v-bind('textareaPosition.y + "px"');
      background-color: rgba($color: #fff, $alpha: 0.8);
      transform: translate(-10%, -10%);
    }
    .text-handle-show {
      border: 2px solid;
      .text-btn-left,
      .text-btn-right {
        display: block;
      }
    }
  }
}

.tools {
  position: relative;
  top: 0;
  z-index: 6;
  height: v-bind('TOP_BAR_HEIGHT + "px"');
  background-color: v-bind("styleConfig.topBar.backgroundColor");
  width: 100vw;
  display: flex;
  justify-content: space-around;
  font-size: 30rpx;
  color: v-bind("styleConfig.topBar.color");
  > view {
    width: 150rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
}

.mask {
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
  color: #fff;
  .mask-top {
    height: v-bind('(TOP_BAR_HEIGHT + safeArea.top) + "px"');
  }
  .mask-bottom {
    height: calc(100vh - v-bind('(TOP_BAR_HEIGHT + safeArea.top) + "px"'));
    display: flex;
    .mask-left {
      width: v-bind('styleConfig.columns[0].width + "px"');
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      @keyframes move {
        0% {
          transform: translateY(-100rpx);
        }
        50% {
          transform: translateY(100rpx);
        }
        100% {
          transform: translateY(-100rpx);
        }
      }
      .finger {
        animation: move 1s linear infinite;
      }
    }
    .mask-right {
      flex: 1;
      position: relative;
      .mask-right-text {
        writing-mode: vertical-rl;
        position: absolute;
        top: 50%;
        left: 50rpx;
        transform: translateY(-50%);
        font-size: 50rpx;
      }
    }
  }

  .mask-top,
  .mask-right {
    background-color: rgba($color: #000000, $alpha: 0.5);
  }
  .mask-left,
  .mask-left {
    height: 100%;
  }

  .mask-button {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 200rpx;
    border: 3rpx solid #fff;
    padding: 20rpx 50rpx;
    font-size: 30rpx;
    line-height: 30rpx;
    border-radius: 10rpx;
  }
}
</style>
