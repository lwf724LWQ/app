<template>
  <view class="draw-line">
    <Popup ref="popup" @sbumit="popupSbumit"></Popup>
    <view class="tools">
      <view class="">
        <uni-icons type="left" size="20" color="#fff"></uni-icons>
      </view>
      <view class="" @click="revoke">
        <uni-icons type="undo" size="20" color="#fff"></uni-icons>
        <view class="">撤销</view>
      </view>
      <view class="" @click="trash">
        <uni-icons type="trash" size="20" color="#fff"></uni-icons>
        <view class="">清除</view>
      </view>
      <view class="">
        <uni-icons type="redo" size="20" color="#fff"></uni-icons>
        <view class="">分享</view>
      </view>
      <view class="">
        <uni-icons type="download" size="20" color="#fff"></uni-icons>
        <view class="">保存</view>
      </view>
      <view class="">
        <uni-icons type="settings" size="20" color="#fff"></uni-icons>
        <view class="">设置</view>
      </view>
    </view>

    <scroll-view class="container" id="container" @scroll="scroll" :scroll-y="isScroll">
      <view v-if="data" class="data">
        <!-- 绘制图形 -->
        <canvas
          class="line-canvas"
          canvas-id="lineCanvas"
          id="lineCanvas"
          @touchstart="canvasTouchStart"
          @touchmove="canvasTouchMove"
          @touchend="canvasTouchEnd"
        ></canvas>
        <!-- 数字区域 -->
        <view
          class="row"
          v-for="item in data"
          :key="item.id"
          @touchmove="touchmove"
          @touchend="touchend"
        >
          <view class="column-1">
            <view class="issueno">{{ item.issueno }}</view>
            <view class="date">{{ dateFromat(item.opendate) }}</view>
          </view>

          <view class="column-2">
            <view
              class="item"
              :class="{ active: pointActives[item.id + 0] }"
              :style="{ backgroundColor: pointActives[item.id + 0]?.color || '' }"
              :id="item.id + 0"
              @touchstart="touchstart($event, item.id + 0)"
              >{{ item.number.reduce((a, b) => Number(a) + Number(b), 0) }}</view
            >
          </view>

          <view class="column-3">
            <view v-for="(number, index) in item.number" :key="index">
              <view
                class="item"
                :class="{ active: pointActives[item.id + (index + 1)] }"
                :style="{ backgroundColor: pointActives[item.id + (index + 1)]?.color || '' }"
                :id="item.id + (index + 1)"
                @touchstart="touchstart($event, item.id + (index + 1))"
                >{{ number }}</view
              >
            </view>
          </view>
        </view>
        <!-- 空白区域 -->
        <view
          class="row"
          v-for="row in 6"
          :key="row"
          @touchmove="touchmove"
          @touchend="spaceTouchend"
        >
          <view class="column-1"></view>

          <view class="column-2">
            <view
              class="marker"
              v-if="marks[`${row}-0`]"
              :style="{ backgroundColor: marks[`${row}-0`].style.color || '' }"
            >
              <view class="condition">{{ marks[`${row}-0`].marker.condition }}</view>
              <view class="number">{{ marks[`${row}-0`].marker.numbers.join('') }}</view>
            </view>
            <view
              class="item"
              v-else
              :class="{ active: pointActives[`${row}0`] }"
              :id="`${row}0`"
              @touchstart="touchstart($event, `${row}0`)"
            ></view>
          </view>

          <view class="column-3">
            <view v-for="(val, index) in 5" :key="val">
              <view
                v-if="marks[`${row}-${index + 1}`]"
                :class="{ marker: index !== 4, 'marker-5': index === 4 }"
                :style="getColorStyle(`${row}-${index + 1}`)"
              >
                <view class="condition">{{ marks[`${row}-${index + 1}`].marker.condition }}</view>
                <view class="number">{{
                  marks[`${row}-${index + 1}`].marker.numbers.join('')
                }}</view>
              </view>
              <view
                class="item"
                v-else
                :class="{ active: pointActives[`${row}${index + 1}`] }"
                :style="{ backgroundColor: pointActives[`${row}${index + 1}`]?.color || '' }"
                :id="`${row}${index + 1}`"
                @touchstart="touchstart($event, `${row}${index + 1}`)"
              ></view>
            </view>
          </view>
        </view>
        <!-- 悬浮文字 -->
        <view
          class="text"
          v-for="(item, index) in textList"
          :key="index"
          :style="{
            top: item.text.position.y - 100 * ratio + 'px',
            left: item.text.position.x + 'px',
            fontSize: item.style.fontSize + 'px',
            lineHeight: item.style.fontSize + 'px',
            borderColor: item.style.color
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
      type="closeempty"
      size="20"
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
    ></ModeSelect>
    <view class="lock" @click="lock" v-show="isLockShow">
      <uni-icons type="locked-filled" size="30" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { getCurrentInstance } from 'vue'
// import mock from './mock.json'
import Popup from '@/components/juWang/Popup.vue'
import ColorSelect from '@/components/juWang/ColorSelect.vue'
import ModeSelect from '@/components/juWang/ModeSelect.vue'
import { DrawShape } from './drawMethod'
import dayjs from 'dayjs'

//解析日期
const weekMap = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六'
}
const dateFromat = (dateStr) => {
  const dateArr = dateStr.split('-')
  const date = dayjs(dateStr).format('M/D')
  const dateArr2 = date.split('/')
  const dateStr2 = `${dateArr2[0]}/${dateArr2[1]} ${weekMap[dayjs(dateStr).format('d')]}`
  return dateStr2
}

const instance = getCurrentInstance()
let ratio
let lineCtx
// let graphicsCtx
const popup = ref(null)

// const uni.getSystemInfo
const systemInfo = ref(uni.getSystemInfoSync())
// console.log(systemInfo.value)

// 页面数据
const data = ref([])
let positionList
const getData = async () => {
  const res = await uni.request({
    url: 'http://caimi.s7.tunnelfrp.com/web/ticket/query?tname=排列五&page=1&limit=10'
  })
  data.value = res.data.data.records.reverse()
  data.value.forEach((item) => {
    item.number = item.number.split(' ').slice(0, 5)
  })
  // data.value = mock.data.records
  // data.value.forEach((item) => {
  //   item.number = item.number.split(' ').slice(0, 5)
  // })

  await nextTick()
  const query = uni.createSelectorQuery().in(instance.proxy)
  query
    .selectAll('.item')
    .boundingClientRect((data) => {
      // console.log("节点离页面顶部的距离为" ,data);
      positionList = data
    })
    .exec()
}
getData()

// 绘制连接线
const curveLineX = ref(0) // 曲线中间坐标
const curveLineY = ref(0)

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
  curveLineX.value = (startX + endX) / 2
  curveLineY.value = (startY + endY) / 2 - scrolltop
}
// 绘制所有线
const drawnLineAll = () => {
  record.value.forEach((item) => {
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

const touchstart = (event, id) => {
  event.preventDefault()
  isScroll.value = false

  iscurveHandleShow.value = false
  const { clientX, clientY } = event.touches[0]
  const position = getPosition(clientX, clientY + scrolltop)
  startX = position.left + position.width / 2
  startY = position.top + position.height / 2
  record.value.push({ point: [position.id] })
}

const touchmove = (event) => {
  event.preventDefault()
  const { clientX, clientY } = event.touches[0]
  drawnLineAll()
  drawnStraightLine(startX, startY, clientX, clientY + scrolltop)
  lineCtx.draw()
}

const touchend = (event) => {
  isScroll.value = true

  const { clientX, clientY } = event.changedTouches[0]
  const position = getPosition(clientX, clientY + scrolltop)
  endX = position.left + position.width / 2
  endY = position.top + position.height / 2

  drawnLineAll()

  const lastRecord = record.value[record.value.length - 1]
  lastRecord.style = { color: color.value, size: size.value }
  if (lastRecord.point[0] !== position.id) {
    lastRecord.point.push(position.id)
    lastRecord.line = { type: 'straight', position: { startX, startY, endX, endY } }
    iscurveHandleShow.value = true
    curveLine(startX, startY, endX, endY)
  } else {
    iscurveHandleShow.value = false
  }
  lineCtx.draw()
}

const curveTouchstart = () => {
  const item = record.value[record.value.length - 1]
  item.line.type = 'curve'
  const { startX, startY, endX, endY } = item.line.position
  item.line.position.centerX = startX / 2 + endX / 2
  item.line.position.centerY = startY / 2 + endY / 2
}
const curveTouchmove = (event) => {
  event.preventDefault()
  const { pageX, pageY } = event.touches[0]
  curveLineX.value = pageX
  curveLineY.value = pageY
  const item = record.value[record.value.length - 1]
  item.line.position.centerX = pageX
  item.line.position.centerY = pageY + scrolltop
  drawnLineAll()
  lineCtx.draw()
}

// 激活列表
const pointActives = computed(() => {
  const result = {}
  record.value.forEach((item) => {
    if (!item?.point) return
    item.point.forEach((id) => {
      result[id] = { color: item.style?.color, isSolid: item.marker?.isSolid }
    })
  })
  return result
})
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
// 获取元素位置信息
const getRect = (id) => {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery().in(instance.proxy)
    query
      .select(id)
      .boundingClientRect((data) => {
        resolve(data)
      })
      .exec()
  })
}
onReady(async () => {
  lineCtx = uni.createCanvasContext('lineCanvas')
  ratio = (await getRect('.container')).width / 750
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
  record.value.forEach((item) => {
    const row = item.marker?.row
    const indexs = item.marker?.indexs
    if (row && indexs) {
      indexs.forEach((index) => {
        result[`${row}-${index}`] = { marker: item.marker, style: item.style }
      })
    }
  })
  return result
})
const popupSbumit = (val) => {
  const item = record.value[record.value.length - 1]
  item.marker = val
  item.marker.row = +item.point[item.point.length - 1][0]
}

// 滚动高度
let scrolltop = 0
const isScroll = ref(true)
const scroll = (event) => {
  scrolltop = event.detail.scrollTop
  curveLineY.value += event.detail.deltaY
}

const spaceTouchend = (event) => {
  touchend(event)
  const item = record.value[record.value.length - 1]
  if (item.point[item.point.length - 1].endsWith('0')) {
    popup.value.openRefernumber()
  } else if (item.point[item.point.length - 1].endsWith('5')) {
    popup.value.openSimple()
  } else {
    popup.value.open(item.point[item.point.length - 1][1] - 1)
  }
}

// 样式控制
const getColorStyle = (id) => {
  const meta = marks.value[id]

  if (id.endsWith('5')) {
    return {
      backgroundColor: meta.style.color
    }
  }

  return {
    backgroundColor: meta.marker.isSolid ? meta.style.color : '#fff',
    border: meta.marker.isSolid ? undefined : `5rpx solid ${meta.style.color}`,
    color: meta.marker.isSolid ? '#fefdf8' : meta.style.color
  }
}

// 绘制图形
const mode = ref('智能曲线')
const pointerEvents = ref('auto') // none | auto

watch(mode, (val) => {
  if (val === '智能曲线') {
    pointerEvents.value = 'auto'
  } else {
    pointerEvents.value = 'none'
  }
})

// 临时记录
let track = [] // 轨迹
let straightLine = {} // 直线
let rect = {} // 方框
let circle = {} // 圆

const isTextInputShow = ref(false)
const textareaPosition = ref({}) // textarea坐标
let textPosition = {}
const textareaValue = ref('')

const textList = computed(() => {
  const result = []
  for (let i = 0; i < record.value.length; i++) {
    const item = record.value[i]
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

const canvasTouchStart = (event) => {
  // console.log('canvasTouchStart', isTextInputShow.value)

  let { x, y } = event.touches[0]
  // 控制页面滚动
  if (x < 250 * ratio) {
    isScroll.value = true
    return
  } else {
    isScroll.value = false
  }

  switch (mode.value) {
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
      if (!isTextInputShow.value) {
        textPosition = { x, y }

        if (x > (750 - 300) * ratio) x = (750 - 300) * ratio
        if (y < 200 * ratio) y = 200 * ratio
        if (y > 1000 * ratio) y = 1000 * ratio
        textareaPosition.value = { x, y }
        isTextInputShow.value = true
      } else {
        isTextInputShow.value = false
        // 修改文字
        if (textChangeIndex !== null) {
          const meta = textList.value[textChangeIndex]
          meta.text.content = textareaValue.value
          // 重新计算文字框大小
          meta.style.width = 'auto'
          meta.style.height = 'auto'
          nextTick(async () => {
            const { width, height } = await getRect(`#text${textChangeIndex}`)
            meta.style.width = width
            meta.style.height = height
            textChangeIndex = null
            textareaValue.value = ''
          })

          return
        }

        if (!textareaValue.value) return
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
          const query = uni.createSelectorQuery().in(instance.proxy)
          const { width, height } = await getRect(`#text${record.value.length - 1}`)
          const item = record.value[record.value.length - 1]
          item.style.width = width
          item.style.height = height
        })
      }

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
}

const canvasTouchMove = (event) => {
  if (isScroll.value) return
  const { x, y } = event.touches[0]
  drawnLineAll()
  switch (mode.value) {
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

const canvasTouchEnd = (event) => {
  if (isScroll.value) return
  switch (mode.value) {
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
      // if (isTextInputShow.value) {
      //   record.value.push({
      //     text: { content: textareaValue.value, position: textPosition },
      //     style: { color: color.value }
      //   })
      //   console.log(record.value)
      // }
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

  const { x, y } = record.value[index].text.position
  tmpTextX = x
  tmpTextY = y
}
const textPositionMove = (e, index) => {
  isTextClick = false

  const { pageX, pageY } = e.touches[0]

  const item = record.value[index]
  item.text.position.x = pageX - textStartX + tmpTextX
  item.text.position.y = pageY - textStartY + tmpTextY
}

let textChangeIndex = null
const cursor = ref(0)
const textPositionEnd = (e, index) => {
  if (isTextClick) {
    isTextInputShow.value = true
    textChangeIndex = index
    textareaValue.value = record.value[index].text.content
    const { pageX: x, pageY: y } = e.changedTouches[0]
    textareaPosition.value = { x, y }
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
const containerPointerEvents = ref('auto')

const lock = () => {
  isModeSelectShow.value = !isModeSelectShow.value
  isColorSelectShow.value = !isColorSelectShow.value
  containerPointerEvents.value = isLockShow.value ? 'none' : 'auto'
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
.draw-line {
  height: 100vh;
  position: relative;
  margin-top: v-bind('systemInfo.safeArea.top');
  .color-select {
    position: absolute;
    bottom: 30rpx;
    left: 30rpx;
    z-index: 999;
  }
  .mode-select {
    position: absolute;
    bottom: 30rpx;
    right: 0;
    z-index: 999;
  }
  .lock {
    position: absolute;
    bottom: 30rpx;
    z-index: 999;
    left: 50%;
    transform: translateX(-50%);
    padding: 10rpx;
    background-color: rgba($color: #000000, $alpha: 0.6);
    border-radius: 50%;
  }
}
$tools-height: 100rpx;
.container {
  position: relative;
  max-height: calc(100vh - 100rpx);
  view {
    pointer-events: v-bind('containerPointerEvents');
  }
  .data {
    position: relative;
    .line-canvas {
      position: absolute;
      top: -$tools-height;
      width: 100vw;
      height: calc(100% + $tools-height);
      z-index: 2;
    }
    & > .row:nth-child(1) {
      border-top: 2px solid #8baf9b;
    }
    & > .row:nth-child(4n) {
      border-bottom: 4px solid #8baf9b;
    }
    & > .row:last-child {
      border-bottom: 0;
    }
    .text {
      padding: 9rpx;
      position: absolute;
      border: 2px solid;
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
      top: calc(v-bind('textareaPosition.y + "px"') - 100rpx);
      background-color: rgba($color: #fff, $alpha: 0.8);
      transform: translate(-10%, -10%);
    }
  }
}

.row {
  display: flex;
  border-bottom: 2px solid #8baf9b;
  height: 120rpx;
  text-align: center;
  font-weight: 700;
  color: #91c182;
}
.column-1 {
  width: 160rpx;
  border-right: 4px solid #8baf9b;
  background-color: #90c380;
  color: #e0f0bb;
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
.column-2 {
  width: 90rpx;
  border-right: 4px solid #8baf9b;
  background-color: #e0ecbc;
  display: flex;
  align-items: center;
  justify-content: center;
  .item {
    width: 35rpx;
    height: 35rpx;
    border-radius: 50%;
    line-height: 35rpx;
  }
  .marker {
    width: 35rpx;
    height: 35rpx;
    border-radius: 50%;
    color: #fefdf8;
    border: 5rpx solid #fefdf8;
    position: relative;
    z-index: 2;
    font-size: 25rpx;
    line-height: 35rpx;
    background-color: #f7212d;
  }
}
.column-3 {
  width: 530rpx;
  display: flex;
  border-right: 2px solid #8baf9b;
  font-size: 60rpx;
  & > view {
    border-right: 2px solid #8baf9b;
    width: 106rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    .item {
      width: 72rpx;
      height: 72rpx;
      border-radius: 50%;
      line-height: 72rpx;
    }
  }
  & :nth-child(4) {
    border-right: 0;
  }
  & :nth-child(5) {
    background-color: #e0ecbc;
    border-left: 4px solid #8baf9b;
    border-right: 0;
  }
  .marker {
    width: 90rpx;
    height: 110rpx;
    color: #f7212d;
    font-size: 25rpx;
    line-height: 25rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    z-index: 2;
    .number {
      width: 50rpx;
      overflow-wrap: break-word;
    }
  }
  .marker-5 {
    width: 70rpx;
    height: 70rpx;
    font-size: 30rpx;
    // background-color: #f7212d;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    line-height: 70rpx;
    border: 5rpx solid #f0eee7;
    position: relative;
    z-index: 2;
  }
}

.active {
  background-color: v-bind(color);
  color: #fff;
  border: 6rpx solid #f0eee7;
}
.item {
  position: relative;
  z-index: 3;
  pointer-events: v-bind(pointerEvents);
}

.tools {
  position: sticky;
  top: 0;
  z-index: 6;
  height: $tools-height;
  background-color: #90c380;
  width: 100vw;
  display: flex;
  justify-content: space-around;
  font-size: 20rpx;
  color: #fff;
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
  top: v-bind('curveLineY + "px"');
  left: v-bind('curveLineX + "px"');
  text-align: center;
  transform: translate(-50%, -50%);
}
</style>
