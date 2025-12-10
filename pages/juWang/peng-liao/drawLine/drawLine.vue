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
      class="scroll-view"
      id="container"
      @scroll="scroll"
      :scroll-y="isScroll"
      :scroll-top="scrollInitTop"
      v-if="data.length !== 0"
    >
      <view class="container">
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
            top: item.text.position.y - (TOP_BAR_HEIGHT + safeArea.top + menuButtonInfo) + 'px',
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
                width: item.text.width === 'auto' ? 'auto' : item.text.width + 'px',
                height: item.text.height === 'auto' ? 'auto' : item.text.height + 'px'
              }"
            >
              <view class="text-content" :id="`text-${index}`">{{ item.text.content }}</view>
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
            @touchstart="textTouchstart"
            @touchmove="textTouchmove($event, item.index)"
            @touchend="textTouchend($event, item.index)"
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
// import dayjs from 'dayjs'
import html2canvas from 'html2canvas'
import Setting from '@/components/juWang/Setting.vue'
import { useDrawLineSettingStore } from '@/stores/drawLine.js'
import { getCurvePoint } from './utils'
import { apiTicketQuery } from '@/api/apis.js'
import Share from '@/components/juWang/Share.vue'
import { Draw } from './cnavasMethod'
import { getPointPosition, getRowAndColumn } from './cnavasMethod'
import { getStyleConfig } from './styleConfig'

// //解析日期
// const dateFromat = (dateStr) => {
//   const weekMap = {
//     0: '日',
//     1: '一',
//     2: '二',
//     3: '三',
//     4: '四',
//     5: '五',
//     6: '六'
//   }
//   const date = dayjs(dateStr).format('M/D')
//   const dateArr2 = date.split('/')
//   const dateStr2 = `${dateArr2[0]}/${dateArr2[1]} ${weekMap[dayjs(dateStr).format('d')]}`
//   return dateStr2
// }

const instance = getCurrentInstance()
const getSelectorQuery = () => uni.createSelectorQuery().in(instance.proxy)
let lineCtx
const popup = ref(null)

const systemInfo = uni.getSystemInfoSync()
let ratio = systemInfo.screenWidth / 750
const TOP_BAR_HEIGHT = 130 * ratio

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
// let positionList
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
let gestureStartDistance = 0 // 手势操作开始距离
// let gestureStartCenter = ref({ x: 0, y: 0 }) // 手势操作开始中心位置

const touchstart = (event) => {
  if (Object.keys(event.touches).length >= 2 && options.theme === '其他') {
    const { 0: touch1, 1: touch2 } = event.touches
    gestureStartDistance = Math.sqrt((touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2)

    tmpScale = scale.value
    return
  } else {
    gestureStartDistance = 0
  }

  if (isLock.value) {
    isScroll.value = true
    return
  }
  // 关闭悬浮文字激活
  if (textChangeIndex.value !== null && !isTextInputShow.value) textChangeIndex.value = null
  //禁用曲线控制按钮
  iscurveHandleShow.value = false

  let { x, y } = event.touches[0]
  x = x / scale.value
  y = y / scale.value
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
  if (gestureStartDistance) {
    gesturemove(event)
    event.preventDefault()
    return
  }

  if (isScroll.value) {
    return
  } else {
    event.preventDefault()
  }

  let { x, y } = event.touches[0]
  x = x / scale.value
  y = y / scale.value

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
          startPosition.y - scrolltop / scale.value,
          x,
          y - scrolltop / scale.value,
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
          drawMethod.drawnStraightLine(
            item.x,
            item.y - scrolltop / scale.value,
            x,
            endY - scrolltop / scale.value,
            c,
            size.value
          )
        })
      }
      drawMethod.draw()
      break
    case '自由线':
      const startX = track[track.length - 1].x
      const startY = track[track.length - 1].y - scrolltop / scale.value
      drawMethod.drawnStraightLine(
        startX,
        startY,
        x,
        y - scrolltop / scale.value,
        color.value,
        size.value
      )
      track.push({ x, y })
      drawMethod.draw(true)
      break
    case '直线':
      drawMethod.drawnStraightLine(
        startPosition.x,
        startPosition.y - scrolltop / scale.value,
        x,
        y - scrolltop / scale.value,
        color.value,
        size.value
      )
      drawMethod.draw()
      break
    case '添加文字':
      break
    case '实心方框':
    case '空心方框':
      const width = x - startPosition.x
      const height = y - startPosition.y
      if (mode.value === '实心方框') {
        drawMethod.drawSolidRect(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          width,
          height,
          color.value
        )
      } else {
        drawMethod.drawHollowRect(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
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
        drawMethod.drawSolidCircle(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          x,
          y - scrolltop / scale.value,
          color.value
        )
      } else {
        drawMethod.drawHollowCircle(
          startPosition.x,
          startPosition.y - scrolltop / scale.value,
          x,
          y - scrolltop / scale.value,
          color.value,
          size.value
        )
      }
      drawMethod.draw()
      break
  }
}

const touchend = async (event) => {
  if (gestureStartDistance) {
    gestureend(event)
    return
  }

  if (isScroll.value) return

  let { x, y } = event.changedTouches[0]
  if (mode.value !== '添加文字') {
    x = x / scale.value
    y = y / scale.value
  }
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
        textPosition = { x, y: y + TOP_BAR_HEIGHT }
        textareaPosition.value = { x, y: y + TOP_BAR_HEIGHT }
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
            const { width, height } = await getRect(`#text-${textChangeIndex.value}`)
            meta.style.width = width
            meta.style.height = height
            textChangeIndex.value = null
            textareaValue.value = ''
          })

          return
        }

        // 添加文字
        if (!textareaValue.value) return
        record.value.push({
          text: {
            content: textareaValue.value,
            position: textPosition
          },
          style: {
            color: color.value,
            fontSize: 20
          },
          isSolid: true
        })
        textareaValue.value = ''
        nextTick(async () => {
          const { width, height } = await getRect(`#text-${textList.value.length - 1}`)
          const item = record.value[record.value.length - 1]
          item.text.width = width
          item.text.height = height
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
          curveHandleX.value = (startPosition.x / 2 + endPosition.x / 2) * scale.value
          curveHandleY.value = (startPosition.y / 2 + endPosition.y / 2) * scale.value
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
        // await draw.saveDraw()
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
        // await draw.saveDraw()
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
        // await draw.saveDraw()
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
        // await draw.saveDraw()
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
        // await draw.saveDraw()
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
        // await draw.saveDraw()
        startPosition = {}
        break
    }
  }

  isClick = true
  isFirst = true
}

// 手势缩放
const scale = ref(1)
let tmpScale
const gesturemove = (event) => {
  const { 0: end1, 1: end2 } = event.touches
  if (!end1 || !end2) return
  const gestureEndDistance = Math.sqrt(Math.pow(end1.x - end2.x, 2) + Math.pow(end1.y - end2.y, 2))

  scale.value = (gestureEndDistance / gestureStartDistance) * tmpScale
}

const cnavasWidth = ref(750)

const gestureend = () => {
  cnavasWidth.value = 750 / scale.value
}
watch(
  record,
  () => {
    drawnLineAll(record.value, pointActives.value)
    drawMethod.draw()
  },
  {
    deep: true
  }
)
watch(
  () => options.theme,
  (newVal, oldVal) => {
    if (newVal === '其他' || oldVal === '其他') record.value = []
    if (newVal !== '其他') scale.value = 1
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
  curveHandleY.value = pageY - TOP_BAR_HEIGHT + scrolltop - safeArea.top
  curveHandleX.value = pageX
  const y = (curveHandleY.value / scale.value - centerY) * 2 + centerY
  const x = (curveHandleX.value / scale.value - centerX) * 2 + centerX
  drawMethod.drawnCurveLine(
    startX,
    startY - scrolltop / scale.value,
    x,
    y - scrolltop / scale.value,
    endX,
    endY - scrolltop / scale.value,
    color.value,
    size.value
  )
  drawMethod.draw()
  if (isFirst) {
    record.value[record.value.length - 1].line = {}
    isFirst = false
  }
}
const curveTouchend = () => {
  const { startX, startY, centerX, centerY, endX, endY } = curvePosition
  const y = (curveHandleY.value / scale.value - centerY) * 2 + centerY
  const x = (curveHandleX.value / scale.value - centerX) * 2 + centerX

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
}
// 清除
const trash = () => {
  iscurveHandleShow.value = false
  record.value = []
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
        result[`${row}-${index}`] = { mark: item.mark, style: item.style }
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
  const item = record.value[index]
  // const style = item.style
  const contentLength = item.text.content.length

  let row = 1
  while (true) {
    const fs = item.text.height / row
    const cloumn = Math.floor(item.text.width / (fs * 0.6))
    if (row * cloumn >= contentLength) {
      if (fs > 80) {
        item.style.fontSize = 80
        return
      } else {
        item.style.fontSize = fs
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
  const { width, height } = textList.value[textList.value.length - 1].text

  tmpTextWidth = width
  tmpTextHeight = height
}

const textTouchmove = (e, index) => {
  const { pageX, pageY } = e.touches[0]

  const changeWidth = pageX - textStartX
  const changeHeight = pageY - textStartY

  const item = record.value[index]

  if (item.text.fontSize < 20 && (changeWidth < 0 || changeHeight < 0)) return
  item.text.width = changeWidth + tmpTextWidth
  item.text.height = changeHeight + tmpTextHeight

  changeTextFontSize(index)
}
const textTouchend = async (e, index) => {
  const item = record.value[index]
  item.text.width = 'auto'
  item.text.height = 'auto'
  await nextTick()
  const { width, height } = await getRect(`#text-${index}`)
  item.text.width = width
  item.text.height = height

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

    .bg-canvas,
    .base-canvas,
    .paint-canvas,
    .content-canvas,
    .active-canvas {
      // position: absolute;
      // top: -v-bind('TOP_BAR_HEIGHT + "px"');
      width: 100vw;
      // height: calc(100% + v-bind('TOP_BAR_HEIGHT + "px"'));
      height: v-bind('(data.length + options.bottomRow) * 110 + "rpx"');
      /* #ifdef APP */
      top: calc(-130rpx - v-bind('safeArea.top + "px"'));
      /* #endif */
      /* #ifdef MP */
      top: calc(-130rpx - v-bind('safeArea.top + menuButtonInfo + "px"'));
      /* #endif */
      z-index: 2;
      transform: scale(v-bind('scale'));
      transform-origin: 0 0;
    }
    .bg-canvas,
    .base-canvas,
    .content-canvas,
    .active-canvas {
      position: absolute;
      top: 0;
    }
    .paint-canvas,
    .base-canvas,
    .active-canvas {
      width: v-bind('cnavasWidth + "rpx"');
    }
    .paint-canvas {
      position: fixed;
      /* #ifdef H5 */
      top: v-bind('TOP_BAR_HEIGHT + "px"');
      height: calc((100vh - v-bind('TOP_BAR_HEIGHT + "px"')) / v-bind('scale'));
      /* #endif */
      /* #ifdef APP */
      top: v-bind('TOP_BAR_HEIGHT + safeArea.top + "px"');
      height: calc((100vh - v-bind('TOP_BAR_HEIGHT + safeArea.top + "px"')) / v-bind('scale'));
      /* #endif */
      left: 0;
    }

    .curve-handle {
      position: absolute;
      width: 50px;
      z-index: 4;
      /* #ifdef H5 */
      top: v-bind('curveHandleY + "px"');
      /* #endif */
      /* #ifdef APP */
      top: v-bind('curveHandleY + "px"');
      /* #endif */
      left: v-bind('curveHandleX + "px"');
      text-align: center;
      transform: translate(-50%, -50%) scale(v-bind('scale'));
    }

    .text {
      padding: 9rpx;
      position: absolute;
      border: 2px solid transparent;
      border-radius: 5rpx;
      z-index: 5;
      // transform: scale(v-bind('scale'));
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
      top: calc(
        v-bind('textareaPosition.y - safeArea.top - menuButtonInfo + "px"') -
          v-bind('TOP_BAR_HEIGHT + "px"')
      );
      background-color: rgba($color: #fff, $alpha: 0.8);
      transform: translate(-10%, -10%) scale(v-bind('scale'));
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
</style>
