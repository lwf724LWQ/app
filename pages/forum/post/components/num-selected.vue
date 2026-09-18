<template>
  <view class="digit-section">
    <view class="digit-title">
      <text class="digit-title-left">{{ name }}</text>
      <text class="digit-title-right" :class="{ 'is-required': isFixed }">{{ ruleText }}</text>
    </view>
    <view class="number-grid" :class="{ 'is-dense': numberOptions.length > 10 }">
      <view
        v-for="num in numberOptions"
        :key="`thousand-${num}`"
        class="number-item"
        :class="{
          'number-selected': isNumberSelected(num),
          'number-disabled': isNumberDisabled,
        }"
        @click="toggleNumber(num)"
      >
        <view class="number-text">{{ num }}</view>
      </view>
    </view>
    <view
      class="main-attack-btn"
      v-if="isShowMainAttackBtn"
      @click="openMainAttackSelectPopup"
    >
      主攻 {{ mainAttack }}
    </view>

    <uni-popup ref="popupRef" mode="center">
      <view class="popup-content">
        <view class="popup-title">{{ name }}:主攻</view>
        <view class="number-grid">
          <view
            class="number-item"
            v-for="item in selectedNumbers"
            :key="item"
            :class="{
              'number-selected': isMainAttactSelected(item),
            }"
            @click="toggleMainAttact(item)"
            ><view class="number-text">{{ item }}</view></view
          >
        </view>
        <button class="main-attack-btn" @click="hidePopup">确定</button>
      </view>
    </uni-popup>
  </view>
</template>
<script setup>
import { ref, defineModel, defineProps, computed } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  maxNum: {
    type: Number,
    default: 6,
  },
  // 最少要选几个，与 maxNum 相等表示「必须选满」
  minNum: {
    type: Number,
    default: 1,
  },
  // 可选号码列表，默认 0-9；和值这类需要 0-27
  numberList: {
    type: Array,
    default: () => ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
  // 是否提供「主攻」（三位数标签没有主攻）
  showMainAttack: {
    type: Boolean,
    default: true,
  },
});

const model = defineModel({ default: { numbers: [], mainAttack: "" } });
const selectedNumbers = ref(model.value.numbers);
model.value.numbers = selectedNumbers;

// 选号区展示的号码
const numberOptions = computed(() => props.numberList || []);

// 是否「必须选满 N 个」
const isFixed = computed(() => props.minNum === props.maxNum);

// 数量提示文案
const ruleText = computed(() => {
  const min = props.minNum;
  const max = props.maxNum;
  const selected = selectedNumbers.value.length;
  if (min === max) {
    return `需选${max}个（已选${selected}）`;
  }
  if (min > 1) {
    return `选${min}-${max}个（已选${selected}）`;
  }
  return `最多选${max}个（已选${selected}）`;
});

const isNotOnlyUniaueTypes = computed(() => {
  return ["任选二", "任选三"].includes(props.name); // 这些类型类型的数字是重复选
});

const isNumberSelected = (num) => {
  if (isNotOnlyUniaueTypes.value) {
    return;
  }
  return selectedNumbers.value.includes(num);
};
const isNumberDisabled = computed(() => {
  if (selectedNumbers.value.length >= props.maxNum) {
    if (isNotOnlyUniaueTypes.value) {
      const lastSelectedNum =
        selectedNumbers.value[selectedNumbers.value.length - 1];
      if (
        (props.name === "任选二" && lastSelectedNum.length === 2) ||
        (props.name === "任选三" && lastSelectedNum.length === 3)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  return false;
});

const toggleNumber = (num) => {
  if (isNotOnlyUniaueTypes.value) {
    // 数字可以重复选
    let lastSelectedNum = selectedNumbers.value.pop();
    if (
      !lastSelectedNum ||
      (props.name === "任选二" && lastSelectedNum.length === 2) ||
      (props.name === "任选三" && lastSelectedNum.length === 3)
    ) {
      if (lastSelectedNum) {
        selectedNumbers.value.push(lastSelectedNum);
      }
      if (isNumberDisabled.value) {
        uni.showToast({
          title: "最多只能选择" + props.maxNum + "组数字",
          icon: "none",
        });
        return;
      }
      lastSelectedNum = num;
    } else {
      lastSelectedNum += num;
    }
    if (selectedNumbers.value.indexOf(lastSelectedNum) > -1) {
      uni.showModal({
        title: "已选择该组数字" + lastSelectedNum,
      });
      return;
    }
    selectedNumbers.value.push(lastSelectedNum);
    return;
  }

  if (isNumberSelected(num)) {
    if (num == mainAttack.value) {
      mainAttack.value = "";
    }
    selectedNumbers.value = selectedNumbers.value.filter((n) => n !== num);
  } else if (!isNumberDisabled.value) {
    selectedNumbers.value.push(num);
  } else if (isNumberDisabled.value) {
    uni.showToast({
      title: "最多只能选择" + props.maxNum + "个数字",
      icon: "none",
    });
    return;
  }
};

// 主攻选择弹窗

//  是否显示主攻按钮
const mainAttack = ref(model.value.mainAttack);
model.value.mainAttack = mainAttack;
const isShowMainAttackBtn = computed(() => {
  return (
    props.showMainAttack &&
    selectedNumbers.value.length > 1 &&
    !isNotOnlyUniaueTypes.value
  );
});
const popupRef = ref(null);
function openMainAttackSelectPopup() {
  popupRef.value.open();
}
function hidePopup() {
  popupRef.value.close();
}
const isMainAttactSelected = function (num) {
  return mainAttack.value == num;
};
const toggleMainAttact = function (num) {
  if (isMainAttactSelected(num)) {
    mainAttack.value = "";
    return;
  }
  mainAttack.value = num;
};
</script>
<style scoped lang="scss">
.digit-section {
  margin-bottom: 40rpx;
}

.digit-title {
  display: flex;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
  width: 100%;
  .digit-title-left {
    flex: 1;
  }

  .digit-title-right {
    /* 必须选满时用红色提示 */
    &.is-required {
      color: #ff4757;
      font-weight: bold;
    }
  }
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10rpx;

  /* 号码较多时（如和值 0-27）收紧排布 */
  &.is-dense {
    grid-template-columns: repeat(7, 1fr);
    gap: 8rpx;

    .number-item {
      height: 56rpx;
    }

    .number-text {
      font-size: 24rpx;
    }
  }
}

.number-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  background-color: #fff;
  border-radius: 12rpx;
  border: 2rpx solid #dcdfe6;
  transition: all 0.3s;

  &.number-selected {
    background-color: #ff4757;
    border-color: #ff4757;

    .number-text {
      color: #fff;
    }
  }

  &.number-disabled:not(.number-selected) {
    opacity: 0.5;
  }
}

.number-text {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}
.main-attack-btn {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  background-color: #ff4757;
  color: #fff;
  margin-top: 20rpx;
  font-weight: bold;
}
.popup-content {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  .popup-title {
    font-size: 36rpx;
    font-weight: bold;
  }
  .number-grid {
    width: 280rpx;
    height: 120rpx;
    display: flex;
    padding: 20rpx;
    .number-item {
      width: 100rpx;
    }
  }
}
</style>
