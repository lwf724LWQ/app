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
      <view class="" @click="saveImage">
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
      class="container"
      id="container"
      @scroll="scroll"
      :scroll-y="isScroll"
      :scroll-top="scrollInitTop"
      v-if="data.length !== 0"
    >
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
      <!-- 悬浮文字，top减去容器到顶部的距离（canvas top） -->
      <view
        class="text"
        :class="{ 'text-handle-show': index === textChangeIndex }"
        v-for="(item, index) in textList"
        :key="index"
        :style="{
          top: item.text.position.y - (130 * ratio + safeArea.top + menuButtonInfo) + 'px',
          left: item.text.position.x + 'px',
          fontSize: item.style.fontSize + 'px',
          lineHeight: item.style.fontSize + 'px',
          borderColor: index === textChangeIndex ? item.style.color : ''
        }"
      >
        <view
          class="text-container"
          :style="textStyle(index)"
          @touchstart="textPositionStart($event, index)"
          @touchmove="textPositionMove($event, index)"
          @touchend="textPositionEnd($event, index)"
        >
          <view
            class="text-item"
            :style="{
              width: item.style.width === 'auto' ? 'auto' : item.style.width + 'px',
              height: item.style.height === 'auto' ? 'auto' : item.style.height + 'px'
            }"
          >
            <view class="text-content" :id="`text${index}`">{{ item.text.content }}</view>
          </view>
        </view>
        <view
          class="text-btn-left"
          :style="{ backgroundColor: item.style.color }"
          @click="changeTextSolid(item.index)"
          >透</view
        >
        <view
          class="text-btn-right"
          :style="{ backgroundColor: item.style.color }"
          @touchstart="textTouchstart($event, index)"
          @touchmove="textTouchmove($event, index)"
          @touchend="textTouchend($event, index)"
          >拉</view
        >
      </view>
      <!-- 悬浮文字输入框 -->
      <textarea
        class="text-input"
        focus
        auto-height
        v-if="isTextInputShow"
        v-model="textareaValue"
        :cursor="cursor"
      />
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
      >
      </uni-icons>
      <uni-icons type="locked-filled" size="30" color="#fff" v-else></uni-icons>
    </view>
    <!-- 设置 -->
    <Setting class="setting" v-model="isSettingOpen"></Setting>

    <Share ref="shareNode" :getImageUrl="getImageUrl"></Share>
  </view>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getCurrentInstance } from 'vue'
import mock from './mock.json'
import Popup from '@/components/juWang/Popup.vue'
import ColorSelect from '@/components/juWang/ColorSelect.vue'
import ModeSelect from '@/components/juWang/ModeSelect.vue'
import { DrawShape } from './drawMethod'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import Setting from '@/components/juWang/Setting.vue'
import { useDrawLineSettingStore } from '@/stores/drawLine.js'
import { getCurvePoint } from './utils'
import { apiTicketQuery } from '@/api/apis.js'
import Share from '@/components/juWang/Share.vue'
import { Draw } from './cnavasMethod'
import { getPointPosition, getRowAndColumn } from './cnavasMethod'
import { getStyleConfig } from './styleConfig'

//解析日期
const dateFromat = (dateStr) => {
  const weekMap = {
    0: '日',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六'
  }
  const date = dayjs(dateStr).format('M/D')
  const dateArr2 = date.split('/')
  const dateStr2 = `${dateArr2[0]}/${dateArr2[1]} ${weekMap[dayjs(dateStr).format('d')]}`
  return dateStr2
}

const instance = getCurrentInstance()
const getSelectorQuery = () => uni.createSelectorQuery().in(instance.proxy)
let lineCtx
const popup = ref(null)

const systemInfo = uni.getSystemInfoSync()
let ratio = systemInfo.screenWidth / 750

const safeArea = systemInfo.safeAreaInsets // 安全距离

// 获取胶囊按钮高度
let menuButtonInfo = 0
// #ifdef MP
menuButtonInfo = uni.getMenuButtonBoundingClientRect().top * 0.6
// #endif

const windowHeight = systemInfo.windowHeight

const scrollInitTop = ref(0) // 滚动条初始位置

// 设置
const drawLineSettingStore = useDrawLineSettingStore()
const options = drawLineSettingStore.options
const isSettingOpen = ref(false)

watch(
  () => options.showPeriod,
  () => {
    getData()
  }
)
// 设置屏幕常亮
// #ifdef APP || MP
watch(
  () => options.keepScreenOn,
  () => {
    if (options.keepScreenOn) {
      uni.setKeepScreenOn({
        keepScreenOn: true
      })
    } else {
      uni.setKeepScreenOn({
        keepScreenOn: false
      })
    }
  }
)
// #endif

// 页面数据
const data = ref([])
let positionList
let showPeriod = options.showPeriod || 40
const getData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await apiTicketQuery({ tname: type.value, page: '1', limit: showPeriod })

    data.value = res.data.records.reverse()
    data.value.forEach((item) => {
      item.number = item.number?.split(' ')
      if (type.value === '七星彩') item.number.push(item.refernumber)
    })
  } finally {
    uni.hideLoading()
  }

  // data.value = mock.data.records
  // data.value.forEach((item) => {
  //   item.number = item.number.split(' ').slice(0, 5)
  //   if (type.value === '七星彩') {
  //     item.number = item.number.slice(0, 5)
  //     item.number.push(1, item.refernumber)
  //   }
  // })

  await nextTick()
  getPositionList()
}
const getPositionList = () => {
  const query = getSelectorQuery()
  query
    .selectAll('.item')
    .boundingClientRect((data) => {
      positionList = data
    })
    .exec()
}

const curveHandleX = ref(0)
const curveHandleY = ref(0)

const iscurveHandleShow = ref(false)

const color = ref('#f2232b')
const size = ref(3)

// 监听触摸事件
const record = ref([]) // [{point:[12,34] , line:{type:straight/curve,position:{}} , mark:{} , style:{color,size}} , text:'']
let startX, startY, endX, endY

let isClick = true
// 临时数据
let startPosition = { x: 0, y: 0 }
let track = [] // 轨迹
let textPosition = {} // 文字位置

const isTextInputShow = ref(false)
const textareaPosition = ref({}) // textarea坐标
const textareaValue = ref('')
let tmpStartPositions = [] // 保存多个临时位置
let gesturePosition = null // 手势操作开始位置

const touchstart = (event) => {
  if (event.touches.length > 1) {
    gesturePosition = event.touches
    return
  } else {
    gesturePosition = null
  }

  if (isLock.value) {
    isScroll.value = true
    return
  }
  // 关闭悬浮文字激活
  if (textChangeIndex.value !== null && !isTextInputShow.value) textChangeIndex.value = null
  //禁用曲线控制按钮
  iscurveHandleShow.value = false

  const { x, y } = event.touches[0]
  startX = x
  startY = y

  // 判断是否是滚动页面
  const column1Width = styleConfig.value.columns[styleConfig.value.numberStartIndex].left
  if (x < column1Width) {
    isScroll.value = true
    return
  } else {
    isScroll.value = false
  }

  event.preventDefault()

  switch (mode.value) {
    case '智能曲线':
      startPosition = getPointPosition(x, y)
      break
    case '自由线':
      track = [{ x, y }]
      break
    case '直线':
      startPosition = getPointPosition(x, y)
      break
    case '添加文字':
      break
    case '实心方框':
    case '空心方框':
      startPosition = getPointPosition(x, y)
      break
    case '实心圆框':
    case '空心圆框':
      startPosition = getPointPosition(x, y)
      break
  }
}
const colors = [
  '#f2232b',
  '#2f54eb',
  '#fa531c',
  '#13c2c2',
  '#fa8b15',
  '#1791ff',
  '#faad17',
  '#53c41a',
  '#fbdb16',
  '#722ed1',
  '#a0d911',
  '#ec2f96',
  '#bfbfbf',
  '#252628',
  '#795547',
  '#607d8b'
]
let isFirst = true

const touchmove = (event) => {
  if (gesturePosition) {
    gesturemove(event)
    return
  }

  if (isScroll.value) {
    return
  } else {
    event.preventDefault()
  }

  const { x, y } = event.touches[0]
  isClick = false
  // 判断是否是点击
  if (Math.abs(startX - x) < 3 * ratio && Math.abs(startY - y) < 3 * ratio) {
    isClick = true
    return
  }

  // drawnLineAll(record.value)
  switch (mode.value) {
    case '智能曲线':
      // 只执行一次
      if (isFirst) {
        if (options.count === 1) {
          record.value.push({
            point: [startPosition],
            style: { color: color.value, size: size.value, ...options.numberStyle }
          })
        } else {
          for (let index = 0; index < options.count; index++) {
            tmpStartPositions.push({
              x: startPosition.x,
              y: startPosition.y - 110 * ratio * index * (options.distance + 1),
              row: startPosition.row - index * (options.distance + 1),
              column: startPosition.column
            })
          }

          const recordList = []
          const colorStartIndex = colors.indexOf(color.value)
          for (let index = 0; index < options.count; index++) {
            recordList.push({
              point: [tmpStartPositions[index]],
              style: {
                color:
                  options.colorType === 'single' ? color.value : colors[colorStartIndex + index],
                size: size.value,
                ...options.numberStyle
              }
            })
          }
          record.value.push(recordList)
        }
      }
      isFirst = false

      // 绘制连线
      if (options.count === 1) {
        drawMethod.drawnStraightLine(
          startPosition.x,
          startPosition.y,
          x,
          y,
          color.value,
          size.value
        )
      } else {
        let c = color.value
        const colorStartIndex = colors.indexOf(c)

        tmpStartPositions.forEach((item, index) => {
          if (options.colorType !== 'single') {
            c = colors[colorStartIndex + index]
          }
          const endY = y - 110 * ratio * index * (options.distance + 1)
          drawMethod.drawnStraightLine(item.x, item.y, x, endY, c, size.value)
        })
      }
      drawMethod.draw(false)
      break
    case '自由线':
      const startX = track[track.length - 1].x
      const startY = track[track.length - 1].y
      drawMethod.drawnStraightLine(startX, startY, x, y, color.value, size.value)
      track.push({ x, y })
      drawMethod.draw(true)
      break
    case '直线':
      drawMethod.drawnStraightLine(startPosition.x, startPosition.y, x, y, color.value, size.value)
      drawMethod.draw()
      break
    case '添加文字':
      break
    case '实心方框':
    case '空心方框':
      const width = x - startPosition.x
      const height = y - startPosition.y
      if (mode.value === '实心方框') {
        drawMethod.drawSolidRect(startPosition.x, startPosition.y, width, height, color.value)
      } else {
        drawMethod.drawHollowRect(
          startPosition.x,
          startPosition.y,
          width,
          height,
          color.value,
          size.value
        )
      }
      drawMethod.draw()
      break
    case '实心圆框':
    case '空心圆框':
      if (mode.value === '实心圆框') {
        drawMethod.drawSolidCircle(startPosition.x, startPosition.y, x, y, color.value)
      } else {
        drawMethod.drawHollowCircle(startPosition.x, startPosition.y, x, y, color.value, size.value)
      }
      drawMethod.draw()
      break
  }
}

const touchend = async (event) => {
  if (gesturePosition) {
    gestureend(event)
    return
  }

  if (isScroll.value) return

  let { x, y } = event.changedTouches[0]
  // 判断是否点击
  if (isClick) {
    // 添加文字
    if (mode.value === '添加文字') {
      if (!isTextInputShow.value) {
        // 弹出输入框
        if (textChangeIndex.value !== null) {
          textChangeIndex.value = null
          return
        }
        textPosition = { x, y }
        textareaPosition.value = { x, y }
        isTextInputShow.value = true
      } else {
        isTextInputShow.value = false
        // 修改文字
        if (textChangeIndex.value !== null) {
          const index = textList.value[textChangeIndex.value].index
          const meta = record.value[index]

          meta.text.content = textareaValue.value
          // 重新计算文字框大小
          meta.style.width = 'auto'
          meta.style.height = 'auto'
          nextTick(async () => {
            const { width, height } = await getRect(`#text${textChangeIndex.value}`)
            meta.style.width = width
            meta.style.height = height
            textChangeIndex.value = null
            textareaValue.value = ''
          })

          return
        }

        if (!textareaValue.value) return
        // 添加文字
        record.value.push({
          text: {
            content: textareaValue.value,
            position: textPosition
          },
          style: {
            color: color.value,
            // width: 0,
            // height: 0,
            fontSize: 20
          },
          isSolid: true
        })
        textareaValue.value = ''
        nextTick(async () => {
          const { width, height } = await getRect(`#text${textList.value.length - 1}`)
          const item = record.value[record.value.length - 1]
          item.style.width = width
          item.style.height = height
        })
      }
    } else {
      const position = getPointPosition(startPosition.x, startPosition.y)
      record.value.push({
        point: [position],
        style: { color: color.value, ...options.numberStyle }
      })
      if (position.row > data.value.length - 1) openPopup()
    }
  } else {
    switch (mode.value) {
      case '智能曲线':
        const lastRecord = record.value[record.value.length - 1]

        let endPosition

        const addRecord = (record, startPosition, endPosition) => {
          // 如果最后位置不是开始位置，则添加当前点
          if (
            startPosition.row !== endPosition.row ||
            startPosition.column !== endPosition.column
          ) {
            record.point.push(endPosition)
            if (options.lineType === 'straight') {
              record.line = {
                type: 'straight',
                position: {
                  startX: startPosition.x,
                  startY: startPosition.y,
                  endX: endPosition.x,
                  endY: endPosition.y
                }
              }
            } else {
              const [upPoint, downPoint, upOffset, downOffset] = getCurvePoint(
                startPosition.x,
                startPosition.y,
                endPosition.x,
                endPosition.y,
                50 * ratio
              )
              if (options.lineType === 'curveUp') {
                nextTick(() => {
                  curveHandleX.value = upPoint.x
                  curveHandleY.value = upPoint.y - scrolltop
                })

                record.line = {
                  type: 'curve',
                  position: {
                    startX: startPosition.x,
                    startY: startPosition.y,
                    centerX: upOffset,
                    centerY: upPoint.y,
                    endX: endPosition.x,
                    endY: endPosition.y
                  }
                }
              } else if (options.lineType === 'curveDown') {
                nextTick(() => {
                  curveHandleX.value = downPoint.x
                  curveHandleY.value = downPoint.y - scrolltop
                })
                record.line = {
                  type: 'curve',
                  position: {
                    startX: startPosition.x,
                    startY: startPosition.y,
                    centerX: downOffset,
                    centerY: downPoint.y,
                    endX: endPosition.x,
                    endY: endPosition.y
                  }
                }
              }
            }
          }

          // 结束位置为空白区域，同时为数字列、结束位置没有标记、允许数字选择器
          if (
            endPosition.row > data.value.length - 1 &&
            endPosition.column >= styleConfig.value.numberStartIndex &&
            !marks.value[`${endPosition.row}-${endPosition.column}`] &&
            options.numberPicker
          ) {
            openPopup()
          }
        }
        if (options.count === 1) {
          endPosition = getPointPosition(x, y)
          if (endPosition) {
            addRecord(lastRecord, startPosition, endPosition)
          }
        } else {
          for (let index = 0; index < lastRecord.length; index++) {
            const record = lastRecord[index]
            endPosition = getPointPosition(x, y - 110 * ratio * index * (options.distance + 1))
            addRecord(record, tmpStartPositions[index], endPosition)
          }
        }
        // 是否显示曲线控制按钮
        if (options.dragPoint && options.count === 1) {
          const sPosition = options.count === 1 ? startPosition : tmpStartPositions[0]
          curveHandleX.value = sPosition.x / 2 + endPosition.x / 2
          curveHandleY.value = sPosition.y / 2 + endPosition.y / 2
          iscurveHandleShow.value = true
        } else {
          iscurveHandleShow.value = false
        }

        tmpStartPositions = []
        drawMethod.draw()

        break
      case '自由线':
        record.value.push({
          line: {
            type: 'track',
            position: track
          },
          style: { color: color.value, size: size.value }
        })
        await draw.saveDraw()
        track = []
        break
      case '直线':
        record.value.push({
          line: {
            type: 'straight',
            position: { startX: startPosition.x, startY: startPosition.y, endX: x, endY: y }
          },
          style: { color: color.value, size: size.value }
        })
        await draw.saveDraw()
        startPosition = {}
        break
      case '添加文字':
        break
      case '实心方框':
        record.value.push({
          line: {
            type: 'solidRect',
            position: {
              x: startPosition.x,
              y: startPosition.y,
              width: x - startPosition.x,
              height: y - startPosition.y
            }
          },
          style: { color: color.value }
        })
        await draw.saveDraw()
        startPosition = {}
        break
      case '空心方框':
        record.value.push({
          line: {
            type: 'hollowRect',
            position: {
              x: startPosition.x,
              y: startPosition.y,
              width: x - startPosition.x,
              height: y - startPosition.y
            }
          },
          style: { color: color.value, size: size.value }
        })
        await draw.saveDraw()
        startPosition = {}
        break
      case '实心圆框':
        record.value.push({
          line: {
            type: 'solidCircle',
            position: { startX: startPosition.x, startY: startPosition.y, endX: x, endY: y }
          },
          style: { color: color.value, size: size.value }
        })
        await draw.saveDraw()
        startPosition = {}
        break
      case '空心圆框':
        record.value.push({
          line: {
            type: 'hollowCircle',
            position: { startX: startPosition.x, startY: startPosition.y, endX: x, endY: y }
          },
          style: { color: color.value, size: size.value }
        })
        await draw.saveDraw()
        startPosition = {}
        break
    }
  }

  isClick = true
  isFirst = true
}

// 手势缩放
const gesturemove = (event) => {
  console.log('gesturemove', event)
  // 计算缩放比例
  const [start1, start2] = gesturePosition
  const [end1, end2] = event.touches
  const scale =
    Math.sqrt(Math.pow(end1.pageX - end2.pageX, 2) + Math.pow(end1.pageY - end2.pageY, 2)) /
    Math.sqrt(Math.pow(start1.pageX - start2.pageX, 2) + Math.pow(start1.pageY - start2.pageY, 2))
  // 计算缩放后的画布大小
  const newWidth = canvasWidth * scale
  const newHeight = canvasHeight * scale
  // 计算缩放后的画布位置
  const offsetX = (event.center.x - canvasWidth / 2) * scale - (event.center.x - canvasWidth / 2)
  const offsetY = (event.center.y - canvasHeight / 2) * scale - (event.center.y - canvasHeight / 2)
}
const gestureend = (event) => {
  console.log('gestureend', event)
}
watch(
  record,
  () => {
    drawnLineAll(record.value, pointActives.value)
  },
  {
    deep: true
  }
)
watch(
  () => options.theme,
  (newVal, oldVal) => {
    if (newVal === '其他' || oldVal === '其他') record.value = []
    drawLineSettingStore.setStyleConfig(type.value, options.theme)
    styleConfig.value = drawLineSettingStore.styleConfig
    draw.redraw(record.value, pointActives.value)
    iscurveHandleShow.value = false
  }
)

const openPopup = () => {
  let item = record.value[record.value.length - 1]
  if (Array.isArray(item)) item = item[0]

  const column = item.point[item.point.length - 1].column
  popup.value.open(column)
}

// 修改曲线
let curvePosition
const curveTouchstart = () => {
  const [startPosition, endPosition] = record.value[record.value.length - 1].point

  curvePosition = {
    startX: startPosition.x,
    startY: startPosition.y,
    centerX: startPosition.x / 2 + endPosition.x / 2,
    centerY: startPosition.y / 2 + endPosition.y / 2,
    endX: endPosition.x,
    endY: endPosition.y
  }
}
const curveTouchmove = (event) => {
  event.preventDefault()
  const { pageX, pageY } = event.touches[0]

  const { startX, startY, centerX, centerY, endX, endY } = curvePosition
  curveHandleY.value = pageY + scrolltop - 130 * ratio
  curveHandleX.value = pageX
  const y = (curveHandleY.value - centerY) * 2 + centerY
  const x = (curveHandleX.value - centerX) * 2 + centerX
  drawMethod.drawnCurveLine(startX, startY, x, y, endX, endY, color.value, size.value)
  drawMethod.draw()
  if (isFirst) {
    record.value[record.value.length - 1].line = {}
    isFirst = false
  }
}
const curveTouchend = (event) => {
  const { pageX, pageY } = event.changedTouches[0]

  const { startX, startY, centerX, centerY, endX, endY } = curvePosition
  curveHandleY.value = pageY + scrolltop - 130 * ratio
  curveHandleX.value = pageX
  const y = (curveHandleY.value - centerY) * 2 + centerY
  const x = (curveHandleX.value - centerX) * 2 + centerX

  const line = record.value[record.value.length - 1].line
  line.type = 'curve'
  line.position = { startX, startY, centerX: x, centerY: y, endX, endY }
  isFirst = true
}

// 激活列表
const pointActives = computed(() => {
  const result = {}
  record.value.forEach((item) => {
    if (Array.isArray(item) && item.length > 0) {
      item.forEach((item) => {
        if (!item?.point) return
        item.point.forEach(({ row, column }) => {
          result[`${row}-${column}`] = item.style
        })
      })
    } else {
      if (!item?.point) return
      item.point.forEach(({ row, column }) => {
        result[`${row}-${column}`] = item.style
      })
    }
  })
  return result
})

const back = () => {
  uni.navigateBack()
}
// 撤销
const revoke = () => {
  iscurveHandleShow.value = false
  record.value.pop()
  drawnLineAll(record.value)
}
// 清除
const trash = () => {
  iscurveHandleShow.value = false
  record.value = []
  drawnLineAll(record.value)
}
// 获取截图url
const getImageUrl = async () => {
  // #ifdef H5
  const canvas = await html2canvas(document.querySelector('.draw-line'))
  return canvas.toDataURL('image/jpg')
  // #endif

  // #ifdef APP
  return new Promise((resolve) => {
    const pages = getCurrentPages()
    const page = pages[pages.length - 1] // 当前页面
    const currentWebview = page.$getAppWebview()

    const bitmap = new plus.nativeObj.Bitmap('capture')

    currentWebview.draw(bitmap, () => {
      // 保存到本地
      bitmap.save(`_doc/${new Date().getTime()}.jpg`, { overwrite: true }, (res) => {
        resolve(res.target)
        bitmap.clear()
      })
    })
  })
  // #endif
}
// 保存图片
const saveImage = async () => {
  // #ifdef H5
  const url = await getImageUrl()
  const a = document.createElement('a')
  a.href = url
  a.download = 'canvas.png'
  a.click()
  // #endif
  // #ifdef APP
  const url = await getImageUrl()
  uni.saveImageToPhotosAlbum({
    filePath: url,
    success: (res) => {
      uni.showToast({
        title: '保存成功'
      })
    },
    fail: (err) => {
      uni.showToast()
    }
  })
  // #endif
}
// 分享
const shareNode = ref()
const share = async () => {
  // #ifdef H5
  await navigator.clipboard.writeText(window.location.href)
  uni.showToast({ title: '复制链接成功' })
  // #endif
  // #ifdef APP
  shareNode.value.open()
  // #endif
}
// 获取元素位置信息
const getRect = (id) => {
  return new Promise((resolve) => {
    const query = getSelectorQuery()
    query
      .select(id)
      .boundingClientRect((data) => {
        resolve(data)
      })
      .exec()
  })
}
const type = ref('')
onLoad(async (options) => {
  type.value = options.type
})
let draw
let drawnLineAll
let drawMethod
const styleConfig = ref({ topBar: {} })
onReady(async () => {
  drawLineSettingStore.setStyleConfig(type.value, options.theme)
  styleConfig.value = drawLineSettingStore.styleConfig

  const bgCtx = uni.createCanvasContext('bgCanvas')
  const baseCtx = uni.createCanvasContext('baseCanvas')
  const paintCtx = uni.createCanvasContext('paintCanvas')
  const contentCtx = uni.createCanvasContext('contentCanvas')
  const activeCtx = uni.createCanvasContext('activeCanvas')
  drawMethod = new DrawShape(paintCtx)
  await getData()
  const canvasSize = await getRect('#bgCanvas') // canvas 尺寸
  draw = new Draw(bgCtx, baseCtx, paintCtx, contentCtx, activeCtx, data, options, canvasSize)

  drawnLineAll = draw.draw.bind(draw)
  drawnLineAll(record.value)
  // 滚动到底部
  scrollInitTop.value = 9999
  await nextTick()
  isScroll.value = false
})

// 标记列表
const marks = computed(() => {
  const result = {}

  const getMarks = (item) => {
    if (Array.isArray(item)) return
    const row = item.mark?.row
    const indexs = item.mark?.indexs
    if (row && indexs) {
      indexs.forEach((index) => {
        result[`${row}${index}`] = { mark: item.mark, style: item.style }
      })
    }
  }
  record.value.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach(getMarks)
    } else {
      getMarks(item)
    }
  })
  return result
})
const popupSubmit = (val) => {
  let item = record.value[record.value.length - 1]
  if (Array.isArray(item)) item = item[0]
  item.mark = val
  item.mark.row = item.point[item.point.length - 1].row
}

// 滚动高度
let scrolltop = 0
const isScroll = ref(true)
const scroll = (event) => {
  scrolltop = event.detail.scrollTop
  curveHandleY.value += event.detail.deltaY
}

// 样式控制
const getColorStyle = (id) => {
  const meta = marks.value[id]

  if (id.endsWith('5')) {
    return {
      backgroundColor: meta.style.color
    }
  }

  const result = {
    backgroundColor: meta.mark.isSolid ? meta.style.color : '#fff',
    border: meta.mark.isSolid ? undefined : `5rpx solid ${meta.style.color}`,
    color: meta.mark.isSolid ? '#fefdf8' : meta.style.color
  }

  let fontSize = undefined
  if (!meta.mark.condition) {
    if (meta.mark.numbers.length === 1) {
      fontSize = 60
    } else if (meta.mark.numbers.length <= 2) {
      fontSize = 50
    } else {
      fontSize = 40
    }
  }
  if (fontSize) {
    result.fontSize = fontSize * ratio + 'px'
    result.lineHeight = fontSize * ratio + 'px'
    result.padding = '0'
  }

  return result
}

// 绘制图形
const mode = ref('智能曲线')

const textList = computed(() => {
  const result = []
  for (let i = 0; i < record.value.length; i++) {
    const item = record.value[i]
    if (Array.isArray(item)) continue
    if (item.text) {
      result.push({ text: item.text, style: item.style, isSolid: item.isSolid, index: i })
    }
  }
  return result
})

const textStyle = (index) => {
  const meta = textList.value[index]

  return {
    backgroundColor: meta.isSolid ? meta.style.color : 'transparent',
    color: meta.isSolid ? '#fff' : meta.style.color
  }
}

// 悬浮文字框
let textStartX, textStartY
let tmpTextWidth, tmpTextHeight

const changeTextFontSize = (index) => {
  const item = textList.value[index]
  const style = item.style
  const contentLength = item.text.content.length

  let row = 1
  while (true) {
    const fs = style.height / row
    const cloumn = Math.floor(style.width / (fs * 0.6))
    if (row * cloumn >= contentLength) {
      if (fs > 80) {
        style.fontSize = 80
        return
      } else {
        style.fontSize = fs
        return
      }
    }
    row++
    if (row > 10) return
  }
}

const textTouchstart = (e) => {
  isScroll.value = false
  const { pageX, pageY } = e.touches[0]

  textStartX = pageX
  textStartY = pageY
  const { width, height } = textList.value[textList.value.length - 1].style

  tmpTextWidth = width
  tmpTextHeight = height
}

const textTouchmove = (e, index) => {
  const { pageX, pageY } = e.touches[0]

  const changeWidth = pageX - textStartX
  const changeHeight = pageY - textStartY

  const item = textList.value[index]

  if (item.style.fontSize < 20 && (changeWidth < 0 || changeHeight < 0)) return
  item.style.width = changeWidth + tmpTextWidth
  item.style.height = changeHeight + tmpTextHeight

  changeTextFontSize(index)
}
const textTouchend = async (e, index) => {
  const { width, height } = await getRect(`#text${index}`)
  const item = textList.value[index]
  item.style.width = width
  item.style.height = height

  isTextClick = true
}

const changeTextSolid = (index) => {
  record.value[index].isSolid = !record.value[index].isSolid
}

// 更新文字位置
let tmpTextX, tmpTextY
let isTextClick = true
const textPositionStart = (e, index) => {
  isScroll.value = false
  const { pageX, pageY } = e.touches[0]
  textStartX = pageX
  textStartY = pageY

  const { x, y } = textList.value[index].text.position
  tmpTextX = x
  tmpTextY = y
}
const textPositionMove = (e, index) => {
  isTextClick = false

  const { pageX, pageY } = e.touches[0]

  const item = textList.value[index]
  item.text.position.x = pageX - textStartX + tmpTextX
  item.text.position.y = pageY - textStartY + tmpTextY
}

let textChangeIndex = ref(null)
const cursor = ref(0)
const textPositionEnd = (e, index) => {
  if (isTextClick) {
    // 显示边框
    if (textChangeIndex.value === null) {
      textChangeIndex.value = index
      return
    }
    if (textChangeIndex.value !== index) {
      textChangeIndex.value = index
      return
    }
    isTextInputShow.value = true
    textareaValue.value = record.value[textList.value[index].index].text.content
    const { pageX: x, pageY: y } = e.changedTouches[0]
    textareaPosition.value = { x, y: y + scrolltop }
    cursor.value = record.value[index].text.content.length
    return
  }
  isTextClick = true
}

// 锁定页面
const isModeSelectShow = ref(true)
const isColorSelectShow = ref(true)
const isLockShow = ref(true)

const isLock = ref(false)
const lock = () => {
  isLock.value = !isLock.value
  isModeSelectShow.value = !isLock.value
  isColorSelectShow.value = !isLock.value
}
const changeColor = () => {
  isModeSelectShow.value = !isModeSelectShow.value
  isLockShow.value = !isLockShow.value
}
const changeMode = () => {
  isColorSelectShow.value = !isColorSelectShow.value
  isLockShow.value = !isLockShow.value
}
</script>

<style lang="scss" scoped>
@use 'sass:math';
/* #ifdef MP || APP*/
page {
  background-color: v-bind('options.theme.topBar?.backgroundColor');
}
.draw-line {
  background-color: v-bind('options.theme.topBar?.backgroundColor');
}
.container {
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
$tools-height: 130rpx;
.container {
  position: relative;
  height: calc(100% - $tools-height);
  // .data {
  // position: relative;
  .bg-canvas,
  .base-canvas,
  .paint-canvas,
  .content-canvas,
  .active-canvas {
    position: absolute;
    // top: -$tools-height;
    width: 100vw;
    // height: calc(100% + $tools-height);
    height: v-bind('(data.length + options.bottomRow) * 110 + "rpx"');
    /* #ifdef APP */
    top: calc(-130rpx - v-bind('safeArea.top + "px"'));
    /* #endif */
    /* #ifdef MP */
    top: calc(-130rpx - v-bind('safeArea.top + menuButtonInfo + "px"'));
    /* #endif */
    z-index: 2;
  }
  // .base-canvas,
  // .paint-canvas,
  // .content-canvas,
  // .active-canvas {
  //   pointer-events: v-bind('pointerEvents');
  // }
  // & > .row:nth-child(1) {
  //   border-top: 2px solid v-bind('options.theme.borderColor');
  // }
  // & > .row:nth-child(4n) {
  //   border-bottom: 4px solid v-bind('options.theme.borderColor');
  // }
  // & > .row:last-child {
  //   border-bottom: 0;
  // }
  .text {
    padding: 9rpx;
    position: absolute;
    border: 2px solid transparent;
    border-radius: 5rpx;
    z-index: 5;
    .text-container {
      padding: 5rpx 15rpx;
      border-radius: 10rpx;
      .text-item {
        .text-content {
          display: inline-block;
          word-break: break-all;
          vertical-align: top;
        }
      }
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
    // top减去canvas的top
    top: calc(v-bind('textareaPosition.y - safeArea.top - menuButtonInfo + "px"') - $tools-height);
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
  // }
}

// .border {
//   position: relative;
//   z-index: 3;
//   pointer-events: none !important;
// }

.tools {
  position: relative;
  top: 0;
  z-index: 6;
  height: $tools-height;
  background-color: v-bind('styleConfig.topBar.backgroundColor');
  width: 100vw;
  display: flex;
  justify-content: space-around;
  font-size: 30rpx;
  color: v-bind('styleConfig.topBar.color');
  > view {
    width: 150rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
}
.curve-handle {
  position: absolute;
  width: 50px;
  z-index: 4;
  top: v-bind('curveHandleY + "px"');
  left: v-bind('curveHandleX + "px"');
  text-align: center;
  transform: translate(-50%, -50%);
}
// .type-2 {
//   .row {
//     .column-1 {
//       width: 200rpx;
//     }
//     .column-2 {
//       width: 100rpx;
//     }
//     .column-3 {
//       width: 750rpx - 300rpx;
//       border-right: none;
//       > view {
//         width: 33.4%;
//       }
//       > view:nth-child(3) {
//         border-right: none;
//       }
//     }
//   }
// }
</style>
