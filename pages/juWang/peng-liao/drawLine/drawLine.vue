<template>
  <view class="draw-line">
    <Popup ref="popup" @submit="popupSubmit" :type="type"></Popup>
    <view class="tools">
      <view class="" @click="back">
        <uni-icons type="left" size="20" color="#fff"></uni-icons>
      </view>
      <view class="" @click="revoke">
        <uni-icons custom-prefix="iconfont" type="icon-chexiao" size="20" color="#fff"></uni-icons>
        <view class="">撤销</view>
      </view>
      <view class="" @click="trash">
        <uni-icons type="trash" size="25" color="#fff"></uni-icons>
        <view class="">清除</view>
      </view>
      <view class="" @click="share">
        <uni-icons custom-prefix="iconfont" type="icon-fenxiang" size="20" color="#fff"></uni-icons>
        <view class="">分享</view>
      </view>
      <view class="" @click="saveImage">
        <uni-icons custom-prefix="iconfont" type="icon-baocun" size="20" color="#fff"></uni-icons>
        <view class="">保存</view>
      </view>
      <view class="" @click="isSettingOpen = !isSettingOpen">
        <uni-icons type="settings" size="25" color="#fff"></uni-icons>
        <view class="">设置</view>
      </view>
    </view>

    <scroll-view
      class="container"
      id="container"
      @scroll="scroll"
      :scroll-y="isScroll"
      :scroll-top="scrollInitTop"
    >
      <view v-if="data.length !== 0" class="data" :class="{ 'type-2': type === '福彩3D' }">
        <!-- 绘制图形 -->
        <canvas
          class="line-canvas"
          canvas-id="lineCanvas"
          id="lineCanvas"
          @touchstart="touchstart"
          @touchmove="touchmove"
          @touchend="touchend"
        ></canvas>
        <!-- 数字区域 -->
        <view class="row" v-for="item in data" :key="item.id">
          <view class="column-1">
            <view class="issueno">{{ item.issueno }}</view>
            <view class="date">{{ dateFromat(item.opendate) }}</view>
          </view>

          <view class="column-2">
            <view
              class="border"
              :class="{
                active: pointActives[item.issueno + 0],
                'border-radius': pointActives[item.issueno + 0]?.isRound
              }"
              :style="{
                borderColor:
                  pointActives[item.issueno + 0]?.isSolid === false
                    ? pointActives[item.issueno + 0].color
                    : '',
                width: pointActives[item.issueno + 0]?.isSolid ? 70 + 'rpx' : '',
                height: pointActives[item.issueno + 0]?.isSolid ? 70 + 'rpx' : ''
              }"
            >
              <view
                class="item"
                :style="{
                  backgroundColor: pointActives[item.issueno + 0]?.isSolid
                    ? pointActives[item.issueno + 0].color
                    : '',
                  color:
                    pointActives[item.issueno + 0]?.isSolid === false
                      ? pointActives[item.issueno + 0].color
                      : ''
                }"
                :id="item.issueno + 0"
                >{{ item.number.reduce((a, b) => Number(a) + Number(b), 0) }}</view
              >
            </view>
          </view>

          <view class="column-3">
            <view v-for="(number, index) in item.number" :key="index">
              <view
                class="border"
                :class="{
                  active: pointActives[item.issueno + (index + 1)],
                  'border-radius': pointActives[item.issueno + (index + 1)]?.isRound
                }"
                :style="{
                  borderColor:
                    pointActives[item.issueno + (index + 1)]?.isSolid === false
                      ? pointActives[item.issueno + (index + 1)].color
                      : '',
                  width: pointActives[item.issueno + (index + 1)]?.isSolid ? 85 + 'rpx' : '',
                  height: pointActives[item.issueno + (index + 1)]?.isSolid ? 85 + 'rpx' : ''
                }"
              >
                <view
                  class="item"
                  :style="{
                    backgroundColor: pointActives[item.issueno + (index + 1)]?.isSolid
                      ? pointActives[item.issueno + (index + 1)].color
                      : '',
                    color:
                      pointActives[item.issueno + (index + 1)]?.isSolid === false
                        ? pointActives[item.issueno + (index + 1)].color
                        : ''
                  }"
                  :id="item.issueno + (index + 1)"
                  >{{ number }}</view
                >
              </view>
            </view>
          </view>
        </view>
        <!-- 空白区域 -->
        <view class="row" v-for="row in options.bottomRow" :key="row">
          <view class="column-1"></view>

          <view class="column-2">
            <view
              class="border"
              :class="{
                active: pointActives[`${row}0`],
                'border-radius': pointActives[`${row}0`]?.isRound
              }"
              :style="{
                borderColor:
                  pointActives[`${row}0`]?.isSolid === false ? pointActives[`${row}0`].color : '',
                width: pointActives[`${row}0`]?.isSolid ? 70 + 'rpx' : '',
                height: pointActives[`${row}0`]?.isSolid ? 70 + 'rpx' : ''
              }"
            >
              <view
                class="item"
                :id="`${row}0`"
                :style="{
                  backgroundColor: pointActives[`${row}0`]?.isSolid
                    ? pointActives[`${row}0`].color
                    : '',
                  color:
                    pointActives[`${row}0`]?.isSolid === false ? pointActives[`${row}0`].color : ''
                }"
                >{{ marks[`${row}0`]?.marker.condition }}</view
              >
            </view>
          </view>

          <view class="column-3">
            <view v-for="(val, index) in data[0].number.length" :key="val">
              <view
                v-if="index !== 4 && marks[`${row}${index + 1}`]?.marker.senior"
                class="senior"
                :style="getColorStyle(`${row}${index + 1}`)"
              >
                <view class="condition">{{ marks[`${row}${index + 1}`].marker.condition }}</view>
                <view class="number">{{
                  marks[`${row}${index + 1}`].marker.numbers.join('')
                }}</view>
              </view>
              <view
                class="border blank"
                v-else
                :class="{
                  active: pointActives[`${row}${index + 1}`],
                  'border-radius': pointActives[`${row}${index + 1}`]?.isRound
                }"
                :style="{
                  borderColor:
                    pointActives[`${row}${index + 1}`]?.isSolid === false
                      ? pointActives[`${row}${index + 1}`].color
                      : '',
                  width: pointActives[`${row}${index + 1}`]?.isSolid ? 85 + 'rpx' : '',
                  height: pointActives[`${row}${index + 1}`]?.isSolid ? 85 + 'rpx' : ''
                }"
              >
                <view
                  class="item"
                  :style="{
                    backgroundColor: pointActives[`${row}${index + 1}`]?.isSolid
                      ? pointActives[`${row}${index + 1}`].color
                      : '',
                    color:
                      pointActives[`${row}${index + 1}`]?.isSolid === false
                        ? pointActives[`${row}${index + 1}`].color
                        : ''
                  }"
                  :id="`${row}${index + 1}`"
                  >{{ marks[`${row}${index + 1}`]?.marker.condition }}</view
                >
              </view>
            </view>
          </view>
        </view>
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
      </view>
    </scroll-view>

    <uni-icons
      custom-prefix="iconfont"
      type="icon-shizi"
      size="18"
      class="curve-handle"
      color="red"
      @touchstart="curveTouchstart"
      @touchmove="curveTouchmove"
      v-show="iscurveHandleShow"
    ></uni-icons>

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
const query = uni.createSelectorQuery().in(instance.proxy)
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
      if (type.value === '七星彩') item.number.slice(0, 5)
    })
  } finally {
    uni.hideLoading()
  }

  // data.value = mock.data.records
  // data.value.forEach((item) => {
  //   item.number = item.number.split(' ').slice(0, 3)
  //   if (type.value === '七星彩') item.number.slice(0, 5)
  // })

  await nextTick()
  getPositionList()
}
const getPositionList = () => {
  const query = uni.createSelectorQuery().in(instance.proxy)
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

let drawnStraightLine,
  drawnCurveLine,
  drawnTrack,
  drawSolidRect,
  drawHollowRect,
  drawSolidCircle,
  drawHollowCircle

// 绘制曲线
const curveLine = (startX, startY, endX, endY) => {
  drawnStraightLine(startX, startY, endX, endY)
  curveHandleX.value = (startX + endX) / 2
  curveHandleY.value = (startY + endY) / 2 - scrolltop
}
// 绘制所有线
const drawnLineAll = () => {
  const draw = (item) => {
    if (!item?.line) return
    const type = item.line.type
    const color = item.style.color
    const size = item.style.size

    if (type === 'straight') {
      const { startX, startY, endX, endY } = item.line.position
      drawnStraightLine(startX, startY, endX, endY, color, size)
    }
    if (type === 'curve') {
      const { startX, startY, centerX, centerY, endX, endY } = item.line.position
      const center = startY / 2 + endY / 2
      const y = (centerY - center) * 2 + center
      drawnCurveLine(startX, startY, centerX, y, endX, endY, color, size)
    }
    if (type === 'track') {
      const track = item.line.position
      drawnTrack(track, color, size)
    }
    if (type === 'solidRect') {
      const { x, y, width, height } = item.line.position
      drawSolidRect(x, y, width, height, color)
    }
    if (type === 'hollowRect') {
      const { x, y, width, height } = item.line.position
      drawHollowRect(x, y, width, height, color, size)
    }
    if (type === 'solidCircle') {
      const { startX, startY, endX, endY } = item.line.position
      drawSolidCircle(startX, startY, endX, endY, color, size)
    }
    if (type === 'hollowCircle') {
      const { startX, startY, endX, endY } = item.line.position
      drawHollowCircle(startX, startY, endX, endY, color, size)
    }
  }
  record.value.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((recordItem) => {
        draw(recordItem)
      })
    } else {
      draw(item)
    }
  })
}
// 监听触摸事件
const record = ref([]) // [{point:[12,34] , line:{type:straight/curve,position:{}} , marker:{} , style:{color,size}} , text:'']
let startX, startY, endX, endY

const getPosition = (x, y) => {
  const result = positionList.find((item) => {
    return x < item.right && y < item.bottom
  })
  return result
}

let isClick = true
let tmpItemMeta = {}
// 临时数据
let track = [] // 轨迹
let straightLine = {} // 直线
let rect = {} // 方框
let circle = {} // 圆
let textPosition = {} // 文字位置

const isTextInputShow = ref(false)
const textareaPosition = ref({}) // textarea坐标
const textareaValue = ref('')
const touchstart = (event) => {
  // 关闭悬浮文字激活
  if (textChangeIndex.value !== null && !isTextInputShow.value) textChangeIndex.value = null
  const { x, y } = event.touches[0]
  startX = x
  startY = y

  if (x < 130 * ratio) {
    isScroll.value = true
    return
  } else {
    isScroll.value = false
  }

  event.preventDefault()

  tmpItemMeta = getPosition(x, y)
  switch (mode.value) {
    case '智能曲线':
      break
    case '自由线':
      track = []
      track.push({ x, y })
      break
    case '直线':
      straightLine = {
        startX: x,
        startY: y
      }
      break
    case '添加文字':
      break
    case '实心方框':
    case '空心方框':
      rect = {}
      rect = {
        x,
        y
      }
      break
    case '实心圆框':
    case '空心圆框':
      circle = {
        startX: x,
        startY: y
      }
      break
  }
  // startX = position.left + position.width / 2
  // startY = position.top + position.height / 2
  // record.value.push({ point: [position.id] })
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
let tmpPositions = []
const touchmove = (event) => {
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

  drawnLineAll()
  switch (mode.value) {
    case '智能曲线':
      if (isFirst) {
        if (options.count === 1) {
          record.value.push({
            point: [tmpItemMeta.id],
            style: { color: color.value, size: size.value, ...options.numberStyle }
          })
          startX = tmpItemMeta.left + tmpItemMeta.width / 2
          startY = tmpItemMeta.top + tmpItemMeta.height / 2
        } else {
          const firstX = tmpItemMeta.left + tmpItemMeta.width / 2
          const firstY = tmpItemMeta.top + tmpItemMeta.height / 2

          for (let index = 0; index < options.count; index++) {
            tmpPositions.push({
              startX: firstX,
              startY: firstY - 110 * ratio * index * (options.distance + 1)
            })
          }

          const recordList = []
          const colorStartIndex = colors.indexOf(color.value) + 1
          for (let index = 0; index < options.count; index++) {
            recordList.push({
              point: [getPosition(tmpPositions[index].startX, tmpPositions[index].startY).id],
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
      if (options.count === 1) {
        drawnStraightLine(startX, startY, x, y)
      } else {
        tmpPositions.forEach((item, index) => {
          tmpPositions[index].endX = x
          tmpPositions[index].endY = y - 110 * ratio * index * (options.distance + 1)
          drawnStraightLine(item.startX, item.startY, item.endX, item.endY)
        })
      }
      break
    case '自由线':
      track.push({ x, y })
      drawnTrack(track)
      break
    case '直线':
      drawnStraightLine(straightLine.startX, straightLine.startY, x, y)
      straightLine.endX = x
      straightLine.endY = y
      break
    case '添加文字':
      break
    case '实心方框':
    case '空心方框':
      rect.width = x - rect.x
      rect.height = y - rect.y
      if (mode.value === '实心方框') {
        drawSolidRect(rect.x, rect.y, rect.width, rect.height)
      } else {
        drawHollowRect(rect.x, rect.y, rect.width, rect.height)
      }
      break
    case '实心圆框':
    case '空心圆框':
      circle.endX = x
      circle.endY = y
      if (mode.value === '实心圆框') {
        drawSolidCircle(circle.startX, circle.startY, circle.endX, circle.endY)
      } else {
        drawHollowCircle(circle.startX, circle.startY, circle.endX, circle.endY)
      }
      break
  }
  lineCtx.draw()
}

const touchend = (event) => {
  if (isScroll.value) return
  else isScroll.value = true

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
      record.value.push({
        point: [tmpItemMeta.id],
        style: { color: color.value, ...options.numberStyle }
      })
      if (tmpItemMeta.id.length < 10) openPopup()
    }
  } else {
    switch (mode.value) {
      case '智能曲线':
        const lastRecord = record.value[record.value.length - 1]

        const addRecord = (record, startPosition, endPosition) => {
          endX = endPosition.left + endPosition.width / 2
          endY = endPosition.top + endPosition.height / 2
          // 如果最后位置不是开始位置，则添加当前点
          if (record.point[0] !== endPosition.id) {
            record.point.push(endPosition.id)
            if (options.lineType === 'straight') {
              record.line = {
                type: 'straight',
                position: { startX: startPosition.startX, startY: startPosition.startY, endX, endY }
              }
            } else {
              const [upPoint, downPoint, upOffset, downOffset] = getCurvePoint(
                startPosition.startX,
                startPosition.startY,
                endX,
                endY,
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
                    startX: startPosition.startX,
                    startY: startPosition.startY,
                    centerX: upOffset,
                    centerY: upPoint.y,
                    endX,
                    endY
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
                    startX: startPosition.startX,
                    startY: startPosition.startY,
                    centerX: downOffset,
                    centerY: downPoint.y,
                    endX,
                    endY
                  }
                }
              }
            }

            curveLine(startX, startY, endX, endY)
            lineCtx.draw()
          }

          // 结束位置为空白区域，同时结束位置没有标记，同时允许数字选择器
          if (endPosition.id.length === 2 && !marks.value[endPosition.id] && options.numberPicker) {
            openPopup()
          }
        }
        if (options.count === 1) {
          const position = getPosition(x, y)
          addRecord(lastRecord, { startX, startY }, position)
          drawnLineAll()
        } else {
          for (let index = 0; index < lastRecord.length; index++) {
            const record = lastRecord[index]
            const position = getPosition(tmpPositions[index].endX, tmpPositions[index].endY)
            addRecord(record, tmpPositions[index], position)
          }
          drawnLineAll()
        }
        tmpPositions = []
        lineCtx.draw()
        break
      case '自由线':
        record.value.push({
          line: {
            type: 'track',
            position: track
          },
          style: { color: color.value, size: size.value }
        })
        track = []
        break
      case '直线':
        record.value.push({
          line: {
            type: 'straight',
            position: straightLine
          },
          style: { color: color.value, size: size.value }
        })

        straightLine = {}
        break
      case '添加文字':
        break
      case '实心方框':
        record.value.push({
          line: {
            type: 'solidRect',
            position: rect
          },
          style: { color: color.value }
        })
        rect = {}
        break
      case '空心方框':
        record.value.push({
          line: {
            type: 'hollowRect',
            position: rect
          },
          style: { color: color.value, size: size.value }
        })
        break
      case '实心圆框':
        record.value.push({
          line: {
            type: 'solidCircle',
            position: circle
          },
          style: { color: color.value, size: size.value }
        })
        break
      case '空心圆框':
        record.value.push({
          line: {
            type: 'hollowCircle',
            position: circle
          },
          style: { color: color.value, size: size.value }
        })
        break
    }
    // 是否显示曲线控制按钮
    if (mode.value === '智能曲线' && options.dragPoint && options.count === 1) {
      iscurveHandleShow.value = true
    } else {
      iscurveHandleShow.value = false
    }
  }

  isScroll.value = true
  isClick = true
  isFirst = true
}
const openPopup = () => {
  let item = record.value[record.value.length - 1]
  if (Array.isArray(item)) item = item[0]
  if (item.point[item.point.length - 1].endsWith('0')) {
    popup.value.openRefernumber()
  } else if (item.point[item.point.length - 1].endsWith('5')) {
    popup.value.openSimple()
  } else {
    popup.value.open(item.point[item.point.length - 1][1] - 1)
  }
}

// 修改曲线
let tmpCenterX
const curveTouchstart = () => {
  const item = record.value[record.value.length - 1]
  item.line.type = 'curve'
  const { startX, startY, endX, endY } = item.line.position
  item.line.position.centerX = startX / 2 + endX / 2
  item.line.position.centerY = startY / 2 + endY / 2
  tmpCenterX = item.line.position.centerX
}
const curveTouchmove = (event) => {
  event.preventDefault()
  const { pageX, pageY } = event.touches[0]
  curveHandleX.value = pageX
  curveHandleY.value = pageY
  const item = record.value[record.value.length - 1]
  item.line.position.centerX = pageX * 2 - tmpCenterX
  item.line.position.centerY = pageY + scrolltop
  drawnLineAll()
  lineCtx.draw()
}

// 激活列表
const pointActives = computed(() => {
  const result = {}
  record.value.forEach((item) => {
    if (Array.isArray(item) && item.length > 0) {
      item.forEach((item) => {
        if (!item?.point) return
        item.point.forEach((id) => {
          result[id] = item.style
        })
      })
    } else {
      if (!item?.point) return
      item.point.forEach((id) => {
        result[id] = item.style
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
  drawnLineAll()
  lineCtx.draw()
}
// 清除
const trash = () => {
  iscurveHandleShow.value = false
  record.value = []
  drawnLineAll()
  lineCtx.draw()
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
  await getData()
  scrollInitTop.value = 9999
})
onReady(async () => {
  lineCtx = uni.createCanvasContext('lineCanvas')
  ;({
    drawnStraightLine,
    drawnCurveLine,
    drawnTrack,
    drawSolidRect,
    drawHollowRect,
    drawSolidCircle,
    drawHollowCircle
  } = new DrawShape(color, size, lineCtx))
})

// 标记列表
const marks = computed(() => {
  const result = {}

  const getMarks = (item) => {
    if (Array.isArray(item)) return
    const row = item.marker?.row
    const indexs = item.marker?.indexs
    if (row && indexs) {
      indexs.forEach((index) => {
        result[`${row}${index}`] = { marker: item.marker, style: item.style }
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
  item.marker = val
  item.marker.row = +item.point[item.point.length - 1][0]
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
    backgroundColor: meta.marker.isSolid ? meta.style.color : '#fff',
    border: meta.marker.isSolid ? undefined : `5rpx solid ${meta.style.color}`,
    color: meta.marker.isSolid ? '#fefdf8' : meta.style.color
  }

  let fontSize = undefined
  if (!meta.marker.condition) {
    if (meta.marker.numbers.length === 1) {
      fontSize = 60
    } else if (meta.marker.numbers.length <= 2) {
      fontSize = 50
    } else {
      fontSize = 39
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

  isScroll.value = true
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
  isScroll.value = true
}

// 锁定页面
const isModeSelectShow = ref(true)
const isColorSelectShow = ref(true)
const isLockShow = ref(true)
const pointerEvents = ref('auto')

const isLock = ref(false)
const lock = () => {
  isLock.value = !isLock.value
  isModeSelectShow.value = !isLock.value
  isColorSelectShow.value = !isLock.value
  pointerEvents.value = isLock.value ? 'none' : 'auto'
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
  background-color: v-bind('options.theme.topBar.backgroundColor');
}
.draw-line {
  background-color: v-bind('options.theme.topBar.backgroundColor');
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
  .data {
    position: relative;
    .line-canvas {
      position: absolute;
      top: -$tools-height;
      width: 100vw;
      height: calc(100% + $tools-height);
      /* #ifdef APP */
      top: calc(-130rpx - v-bind('safeArea.top + "px"'));
      /* #endif */
      /* #ifdef MP */
      top: calc(-130rpx - v-bind('safeArea.top + menuButtonInfo + "px"'));
      /* #endif */
      z-index: 2;
      pointer-events: v-bind('pointerEvents');
    }
    & > .row:nth-child(1) {
      border-top: 2px solid v-bind('options.theme.borderColor');
    }
    & > .row:nth-child(4n) {
      border-bottom: 4px solid v-bind('options.theme.borderColor');
    }
    & > .row:last-child {
      border-bottom: 0;
    }
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
      top: calc(
        v-bind('textareaPosition.y - safeArea.top - menuButtonInfo + "px"') - $tools-height
      );
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

.row {
  display: flex;
  border-bottom: 2px solid v-bind('options.theme.borderColor');
  height: 110rpx;
  text-align: center;
  font-weight: 700;
}
.column-1 {
  width: 160rpx;
  border-right: 4px solid v-bind('options.theme.borderColor');
  background-color: v-bind('options.theme.column1.backgroundColor');
  color: v-bind('options.theme.column1.color');
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 26rpx 0;
  .issueno {
    height: 28rpx;
    font-size: 28rpx;
    line-height: 28rpx;
  }
  .date {
    height: 24rpx;
    font-size: 24rpx;
    line-height: 24rpx;
  }
}
%active {
  background-color: #fcffff;
  .item {
    color: #fff;
  }
}
// 圆角
.border-radius {
  border-radius: 50%;
  .item {
    border-radius: 50%;
  }
}
.column-2 {
  width: 90rpx;
  border-right: 4px solid v-bind('options.theme.borderColor');
  background-color: v-bind('options.theme.column2.backgroundColor');
  color: v-bind('options.theme.column2.color');
  display: flex;
  align-items: center;
  justify-content: center;
  .border {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid transparent;
    padding: 3rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    .item {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .active {
    @extend %active;
    border-color: rgba($color: #000000, $alpha: 0.1);
  }
}
.column-3 {
  .blank {
    font-size: 30rpx;
  }
  background-color: v-bind('options.theme.column3.backgroundColor');
  color: v-bind('options.theme.column3.color');
  width: 530rpx;
  display: flex;
  border-right: 2px solid v-bind('options.theme.borderColor');
  font-size: v-bind('options.fontSize + "rpx"');
  & > view {
    border-right: 2px solid v-bind('options.theme.borderColor');
    width: 106rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    .border {
      width: 76rpx;
      height: 76rpx;
      padding: 4rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 5rpx solid transparent;
      .item {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .active {
      @extend %active;
      border-color: rgba($color: #000000, $alpha: 0.1);
    }
  }
  & :nth-child(4) {
    border-right: 0;
  }
  & :nth-child(5) {
    background-color: v-bind('options.theme.column4.backgroundColor');
    color: v-bind('options.theme.column4.color');
    border-left: 4px solid v-bind('options.theme.borderColor');
    border-right: 0;
  }
  .senior {
    width: 90rpx;
    height: 100rpx;
    color: #f7212d;
    font-size: 27rpx;
    line-height: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    z-index: 2;
    padding: 0 13rpx;
    .condition {
      width: 140%;
    }
    .number {
      width: 100%;
      overflow-wrap: break-word;
    }
  }
  .marker-simple {
    width: 70rpx;
    height: 70rpx;
    font-size: 30rpx;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 70rpx - 5rpx * 2;
    border: 5rpx solid #f0eee7;
    position: relative;
    z-index: 2;
  }
}
.border {
  position: relative;
  z-index: 3;
  pointer-events: none !important;
}

.tools {
  position: relative;
  top: 0;
  z-index: 6;
  height: $tools-height;
  background-color: v-bind('options.theme.topBar.backgroundColor');
  width: 100vw;
  display: flex;
  justify-content: space-around;
  font-size: 30rpx;
  color: v-bind('options.theme.topBar.color');
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
.type-2 {
  .row {
    .column-1 {
      width: 200rpx;
    }
    .column-2 {
      width: 100rpx;
    }
    .column-3 {
      width: 750rpx - 300rpx;
      border-right: none;
      > view {
        width: 33.4%;
      }
      > view:nth-child(3) {
        border-right: none;
      }
    }
  }
}
</style>
