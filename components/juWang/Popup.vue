<template>
  <view>
    <uni-popup ref="popup" type="bottom" class="popup">
      <Message ref="msg"></Message>
      <view class="container">
        <view class="title">
          <view class="text">数字选择器</view>
          <u-switch
            v-model="formMode"
            leftText="高级"
            rightText="简易"
            v-if="isSwitchShow"
          ></u-switch>
        </view>

        <form action="">
          <!-- 高级模式 -->
          <view class="senior" v-show="formMode === '高级'">
            <!-- 号码 -->
            <view class="sub-title">选择号码</view>
            <view class="number">
              <view
                class="item"
                v-for="number in 10"
                :key="number"
                @click="addNumber(number - 1)"
                :class="{ 'bg-active': numbers.includes(number - 1) }"
                >{{ number - 1 }}</view
              >
            </view>
            <!-- 条件 -->
            <view class="sub-title">选择条件</view>
            <view class="condition">
              <view
                class="item"
                v-for="condition in conditions"
                :key="condition"
                @click="addNumberList(condition)"
                :class="{ 'text-active': currentCondition === condition }"
                >{{ condition }}</view
              >
            </view>
            <!-- 效果 -->
            <view class="sub-title sub-title-3">
              <view class="sub-title-text">效果预览</view>
              <radio-group @change="radioChange">
                <label><radio :value="true" :checked="true" color="#FF2103" />实心</label>
                <label class="radio"><radio :value="false" color="#FF2103" />空心</label>
              </radio-group>
            </view>

            <view class="effect">
              <view
                v-for="(item, index) in effectViewList"
                :key="index"
                v-show="effectList.length !== 4"
              >
                <view
                  class="item"
                  :class="{
                    'bg-active': effectList.includes(index) && isSolid,
                    'hollow-active': effectList.includes(index) && !isSolid
                  }"
                >
                  <view class="effect-content" v-show="effectList.includes(index)">
                    <view class="effect-condition">{{
                      currentCondition === 'X' ? '' : currentCondition
                    }}</view>
                    <view class="effect-number">{{ numbers.join('') }}</view>
                  </view>
                </view>
                {{ item }}
              </view>
              <view class="item-all bg-active" v-show="effectList.length === 4">
                {{ numbers.length ? '稳上一码：' + numbers.join('') : '' }}
              </view>
            </view>

            <view class="btns">
              <button class="close" @click="close">关闭</button>
              <button class="submit" @click="seniorSubmit">确认</button>
            </view>
          </view>

          <!-- 简易模式 -->
          <view class="simple" v-show="formMode === '简易'">
            <!-- 号码 -->
            <view class="sub-title">选择号码</view>
            <view class="number">
              <view
                class="item"
                v-for="number in 10"
                :key="number"
                @click="currentCondition = number - 1"
                :class="{ 'bg-active': currentCondition === number - 1 }"
                >{{ number - 1 }}</view
              >
            </view>

            <view class="sub-title">选择对数</view>
            <view class="number">
              <view
                class="item"
                v-for="number in 5"
                :key="number"
                @click="currentCondition = `${number - 1}/${number + 4}`"
                :class="{ 'bg-active': currentCondition === `${number - 1}/${number + 4}` }"
              >
                {{ `${number - 1}/${number + 4}` }}
              </view>
            </view>

            <view class="sub-title">选择条件</view>
            <view class="condition">
              <view
                class="item"
                v-for="condition in simpleConditions"
                :key="condition"
                @click="currentCondition = condition"
                :class="{ 'text-active': currentCondition === condition }"
                >{{ condition }}</view
              >
            </view>

            <view class="btns">
              <button class="close" @click="close">关闭</button>
              <button class="submit" @click="simpleSubmit">确认</button>
            </view>
          </view>
        </form>
      </view>
    </uni-popup>
    <uni-popup ref="refernumberPopup" type="bottom" class="popup">
      <view class="container refernumberPopup">
        <view class="sub-title">选择号码</view>
        <view class="number">
          <view
            class="item"
            v-for="number in 37"
            :key="number"
            @click="currentCondition = number - 1"
            :class="{ 'text-active': currentCondition === number - 1 }"
            >{{ number - 1 }}</view
          >
        </view>

        <view class="sub-title">双单大小</view>
        <view class="condition">
          <view
            class="item"
            v-for="condition in refernumberConditions"
            :key="condition"
            @click="currentCondition = condition"
            :class="{ 'text-active': currentCondition === condition }"
            >{{ condition }}</view
          >
        </view>

        <view class="btns">
          <button class="close" @click="close">关闭</button>
          <button class="submit" @click="refernumberSubmit">确认</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import uSwitch from '@/components/juWang/Switch.vue'
import Message from '@/components/juWang/Message.vue'

const formMode = ref('高级')
const popup = ref(null)
let index = ref(0)
const conditions = computed(() => {
  const result = []
  result.push('单', '双', '大', '小', 'X', ...indexMap[index.value], '杀', '稳码')
  return result
})
const simpleConditions = ref(['单', '双', '大', '小', 'X'])
const isSolid = ref(true)
const effectViewList = ['千 A', '百 B', '十 C', '个 D']
const msg = ref(null)

const open = (column) => {
  popup.value.open('center')
  index.value = column
  effectList.value = [column]
  effectMap.杀 = [column]
}

const radioChange = (val) => {
  isSolid.value = val.detail.value
}

// 表单逻辑
const isSwitchShow = ref(true)
const numbers = ref([])
const addNumber = (number) => {
  if (numbers.value.includes(number)) {
    numbers.value.splice(numbers.value.indexOf(number), 1)
  } else {
    if (numbers.value.length >= 6) {
      msg.value.send('最多选择6个')
      return
    }
    if (currentCondition.value === '杀' || currentCondition.value === '稳码') {
      if (numbers.value.length >= 2) {
        msg.value.send('最多选择2个')
        return
      }
    }
    numbers.value.push(number)
  }

  // 更新选择高亮
  if (!Object.keys(effectMap).includes(currentCondition.value))
    currentCondition.value = getConditionState() || ''
}
const currentCondition = ref('')
const addNumberList = (val) => {
  currentCondition.value = val
  const data = numberMap[val]
  if (data) {
    // 选择数字
    numbers.value = []
    numbers.value.push(...numberMap[val])
  } else {
    // 选择效果
    effectList.value = effectMap[val]
  }
}

const getConditionState = () => {
  for (var key in numberMap) {
    let isActive = true
    if (numberMap[key].length !== numbers.value.length) isActive = false
    numberMap[key].forEach((item) => {
      if (!numbers.value.includes(item)) isActive = false
    })
    if (isActive) return key
  }
}

const numberMap = {
  单: [1, 3, 5, 7, 9],
  双: [0, 2, 4, 6, 8],
  大: [5, 6, 7, 8, 9],
  小: [0, 1, 2, 3, 4],
  X: ['X']
}

const effectList = ref([0])
const effectMap = {
  头尾合: [0, 3],
  千百合: [0, 1],
  中肚合: [1, 2],
  千十合: [0, 2],
  十个合: [2, 3],
  百个合: [1, 3],
  杀: [undefined],
  稳码: [0, 1, 2, 3]
}
const indexMap = {
  0: ['头尾合', '千百合', '千十合'],
  1: ['中肚合', '千百合', '百个合'],
  2: ['中肚合', '千十合', '十个合'],
  3: ['头尾合', '百个合', '十个合'],
  4: []
}

// const addNum = (num1, num2) => {
//   numbers.value = []
//   numbers.value.push(num1, num2)
//   currentCondition.value = `${num1}/${num2}`
// }

// 提交
const sbumit = defineEmits(['sbumit'])
const seniorSubmit = () => {
  if (numbers.value.length === 0) {
    msg.value.send('至少选择一个号码')
    return
  }
  sbumit('sbumit', {
    condition: currentCondition.value,
    numbers: numbers.value,
    isSolid: isSolid.value,
    indexs: effectList.value.map((item) => item + 1),
    senior: true
  })
  clearForm()
  popup.value.close()
}
const simpleSubmit = () => {
  sbumit('sbumit', {
    condition: currentCondition.value,
    numbers: [],
    isSolid: true,
    indexs: effectList.value.map((item) => item + 1),
    senior: false
  })
  clearForm()
  popup.value.close()
  isSwitchShow.value = true
}
const close = () => {
  popup.value.close()
  refernumberPopup.value.close()
  numbers.value = []
  currentCondition.value = ''
  effectList.value = [1]
  isSwitchShow.value = true
  formMode.value = '高级'
}

const refernumberPopup = ref(null)
const openRefernumber = () => {
  refernumberPopup.value.open('center')
}

const refernumberConditions = ['单', '双', '大', '小']
const refernumberSubmit = () => {
  sbumit('sbumit', { condition: currentCondition.value, numbers: [], isSolid: true, indexs: [0] })
  clearForm()
  refernumberPopup.value.close()
}

const openSimple = () => {
  formMode.value = '简易'
  isSwitchShow.value = false
  open(4)
}

// 清空表单
const clearForm = () => {
  numbers.value = []
  currentCondition.value = ''
  effectList.value = [1]
  isSwitchShow.value = true
  formMode.value = '高级'
}

defineExpose({
  open,
  openRefernumber,
  openSimple
})
</script>

<style lang="scss" scoped>
view {
  box-sizing: border-box;
}
.popup {
  font-size: 28rpx;
}
.container {
  background-color: #fff;
  width: 90vw;
  border-radius: 20rpx;
  padding: 40rpx;
}
.title {
  display: flex;
  align-items: center;
  justify-content: end;
  font-weight: 600;
  font-size: 35rpx;
  .text {
    margin-right: 30rpx;
  }
}
.text-active {
  background-color: #fff5ef;
  color: #ff4f37;
}
.bg-active {
  background-color: #ff3d1f !important;
  color: #fef6ed !important;
}
.hollow-active {
  color: #ff3d1f;
  border: 1rpx solid #ff3d1f;
}
.btns {
  display: flex;
  margin-top: 50rpx;
  .close,
  .submit {
    width: 240rpx;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 120rpx;
    box-shadow: 5px 5px 5px #c0c0be;
    color: #fcfcf9;
    font-size: 30rpx;
    &::after {
      border: 0;
    }
  }
  .close {
    background-color: #999997;
  }
  .submit {
    background-color: #ff3d1e;
  }
}
.senior,
.simple {
  .number {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    > view {
      text-align: center;
      width: 80rpx;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      background-color: #f6f6f3;
      margin: 10rpx auto;
    }
  }
  .condition {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    > view {
      text-align: center;
      width: 100rpx;
      height: 70rpx;
      line-height: 70rpx;
      border-radius: 15rpx;
      background-color: #f6f6f3;
      margin: 10rpx auto;
    }
  }
  .sub-title {
    margin: 20rpx 0;
    font-weight: 600;
  }
  .sub-title-3 {
    display: flex;
    justify-content: end;
    .radio {
      margin-left: 50rpx;
    }
    .sub-title-text {
      flex: 1;
    }
  }
  .effect {
    display: flex;
    justify-content: space-between;
    text-align: center;
    // line-height: 70rpx;
    // align-items: center;
    .item {
      width: 140rpx;
      height: 140rpx;
      background-color: #f6f6f3;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .effect-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .effect-condition {
          text-align: center;
        }
        .effect-number {
          width: 50rpx;
          height: 100%;
          overflow-wrap: break-word;
        }
      }
    }
    .item-all {
      width: 100%;
      height: 140rpx;
      line-height: 140rpx;
      margin-bottom: 37rpx;
      background-color: #f6f6f3;
      border-radius: 20rpx;
    }
  }
}

.refernumberPopup {
  .sub-title {
    margin: 30rpx 0;
    font-weight: 600;
  }
  .number {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    gap: 30rpx;
    .item {
      background-color: #f6f6f3;
      border-radius: 50%;
      aspect-ratio: 1;
      line-height: 200%;
    }
  }
  .condition {
    display: flex;
    // justify-content: space-between;

    .item {
      // width: 80rpx;
      background-color: #f6f6f3;
      margin-right: 20rpx;
      border-radius: 8rpx;
      font-size: 23rpx;
      padding: 8rpx 40rpx;
    }
  }
}
</style>
