<template>
  <view class="container">
    <top-navigation-bar title="创建预测方案"></top-navigation-bar>
    <scroll-view class="scroll" :scroll-y="true" :show-scrollbar="false">
      <!-- 创建预测方案的表单 -->
      <view class="create-prognosis-form">
        <!-- 观看价格 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">方案标题</text>
            </view>
          </view>
          <view class="form-item-content">
            <view class="price-input-wrapper">
              <input
                type="text"
                placeholder="请输入预测方案标题"
                class="form-input"
                v-model="form.title"
              />
            </view>
          </view>
          <view class="form-item-content">
            <view class="price-input-wrapper">
              <label class="radio-label">
                <radio
                  value="1"
                  :checked="form.enablePrice === false"
                  @click="form.enablePrice = false"
                >
                  免费
                </radio>
              </label>
              <label class="radio-label">
                <radio
                  value="2"
                  :checked="form.enablePrice === true"
                  @click="form.enablePrice = true"
                >
                  收费
                </radio>
              </label>

              <NumberInput
                v-if="form.enablePrice"
                v-model="form.price"
                :min="0.01"
                class="price-input"
              />
            </view>
          </view>

          <view class="form-item-content">
            <view class="price-input-wrapper">
              <switch :checked="form.isShijiebei" @change="setIsShijiebei"></switch>
              世界杯专栏

              <view class="match-content" v-if="form.isShijiebei" @click="openDataPicker">
                <view class="match-info">
                  <view class="match-info-left-team">
                    <text class="match-info-left-team-tag">[主]</text>
                    {{ matchInfo.homeChs }}
                  </view>
                  <view class="match-info-vs">VS</view>
                  <view class="match-info-right-team">{{ matchInfo.awayChs }}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 专家分析 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">预测内容</text>
            </view>
          </view>
          <view class="form-item-content">
            <textarea
              class="form-textarea"
              v-model="form.expertAnalysis"
              placeholder="在此输入详细的预测内容"
              maxlength="2000"
            ></textarea>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="fixed-bottom">
      <view class="submit-btn" @click="submitPrognosis">发布预测</view>
    </view>
    <!-- 赛事选择弹窗 -->
    <uni-popup ref="dataPicker" type="bottom" safeArea>
      <view class="data-picker-container">
        <view class="data-picker-header">
          <view class="data-picker-header-cancel" @click="closeDataPicker">取消</view>
          <view class="data-picker-header-title">选择赛事</view>
          <view class="data-picker-header-confirm" @click="confirmDataPicker">确定</view>
        </view>
        <picker-view
          v-if="pickerViewVisible"
          :indicatorStyle="indicatorStyle"
          :value="pickerValue"
          @change="bindChangeMatch"
          class="picker-view"
        >
          <picker-view-column>
            <view class="item" v-for="(item, index) in dataTree" :key="index">
              {{ item.text }}
            </view>
          </picker-view-column>
          <picker-view-column style="flex: 2">
            <view class="item" v-for="(item, index) in matchList" :key="index">
              {{ item.text }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>
  </view>
</template>
<script setup>
import { ref, reactive, computed, nextTick } from "vue";
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import { addFootBallPost, getFootBallList } from "@/api/apis.js";
import NumberInput from "@/components/number-input.vue";
import { getAccount } from "../../utils/request";
import dayjs from "dayjs";
import { onLoad } from "@dcloudio/uni-app";

const form = reactive({
  isShijiebei: false,

  enablePrice: true,
  price: 10,

  expertAnalysis: "",
});

const matchInfo = ref({});
const dataTree = ref([]);
const matchList = ref([]);
const pickerValue = ref([]);
const dataPicker = ref(null);
const pickerViewVisible = ref(false);
const indicatorStyle = ref(`height: 50px;`);
const temp_matchInfo = ref({});

// 打开赛事选择框
function openDataPicker() {
  const index1 = dataTree.value.findIndex((item) => item.value === matchInfo.value.fdate);
  const index2 = matchList.value.findIndex((item) => item.value === matchInfo.value.matchId);
  pickerValue.value = [index1 >= 0 ? index1 : 0, index2 >= 0 ? index2 : 0];

  pickerViewVisible.value = false;
  dataPicker.value.open();
  nextTick(() => {
    pickerViewVisible.value = true;
  });
}

// 确认选择赛事
function confirmDataPicker() {
  matchInfo.value = temp_matchInfo.value;
  dataPicker.value.close();
}

// 关闭选择赛事弹框
function closeDataPicker() {
  dataPicker.value.close();
}

function bindChangeMatch(e) {
  const [day, matchInfoIndex] = e.detail.value;
  matchList.value = dataTree.value[day].children;
  temp_matchInfo.value = matchList.value[matchInfoIndex];
}

async function submitPrognosis() {
  const resultForm = {
    expertAnalysis: form.expertAnalysis,
  };
  if (form.expertAnalysis.trim() === "") {
    uni.showModal({ title: "提示", content: "请输入预测内容" });
    return;
  }
  if (form.title.trim() === "") {
    uni.showModal({ title: "提示", content: "请输入预测标题" });
    return;
  }
  if (form.expertAnalysis.trim().split("\n").length > 10) {
    uni.showModal({ title: "提示", content: "预测内容不能超过10行" });
    return;
  }
  const confirmForm = {
    ftype: 1,
    title: form.title,

    // 预测价格
    price: form.enablePrice ? form.price : 0,
    flag: form.enablePrice,

    // 预测结果
    result: JSON.stringify(resultForm),
  };

  if (form.isShijiebei) {
    confirmForm.remark = matchInfo.value.id;
  }

  try {
    uni.showLoading({
      title: "提交中...",
    });
    const res = await addFootBallPost(confirmForm);
    uni
      .showModal({
        title: res.msg,
        showCancel: false,
      })
      .then((res) => {
        if (res.confirm) {
          uni.navigateBack();
        }
      });
  } catch (e) {}
  uni.hideLoading();
}

function setIsShijiebei(e) {
  const value = e.detail.value;
  form.isShijiebei = value;
}

// 获取赛事列表
async function getMatchData() {
  try {
    const res = await getFootBallList("", 0, "世界杯", getAccount());
    if (res && Array.isArray(res.data)) {
      const sortList = res.data.sort((a, b) => b.flag - a.flag); // 收藏的排到前面
      let newArr = [];
      sortList.forEach((match) => {
        const fdate = dayjs(match.matchTime).format("YYYY-MM-DD");
        const mL = newArr.find((item) => item.businessDate === fdate);
        match = { ...match, text: `${match.homeChs} vs ${match.awayChs}`, value: match.matchId };
        if (mL) {
          mL.children.push(match);
          mL.matchCount++;
          return;
        } else {
          newArr.push({
            businessDate: fdate,
            text: dayjs(match.matchTime).format("MM-DD dddd"),
            value: fdate,
            matchCount: 1,
            children: [match],
          });
        }
      });
      newArr = newArr.sort(
        (a, b) => new Date(a.businessDate).getTime() - new Date(b.businessDate).getTime()
      );
      dataTree.value = newArr;
      matchList.value = newArr[0].children;
      return newArr;
    } else {
      uni.showModal({
        content: "后端数据结构错误",
      });
    }
  } catch (error) {
    console.error("获取比赛数据失败:", error);
    uni.showToast({ title: "获取比赛数据失败", icon: "none" });
  }
}

async function init() {
  try {
    await getMatchData();
    return dataTree.value;
  } catch (e) {
    console.log(e);
    uni.showModal({
      title: e.msg || "获取数据失败",
    });
  }
}

onLoad(async (option) => {
  console.log(option);
  if (option && option.matchId) {
    matchInfo.value = { matchId: option.matchId };
  }

  const list = await init();
  if (!matchInfo.value.matchId && list && list.length > 0 && list[0].children.length > 0) {
    // 默认选中第一个赛事
    matchInfo.value = list[0].children[0];
  } else if (matchInfo.value.matchId && list) {
    // 从列表中找到指定的赛事
    const findMatchInfo = dataTree.value
      .reduce((acc, cur) => {
        return acc.concat(cur.children);
      }, [])
      .find((item) => item.matchId === option.matchId);

    if (findMatchInfo) {
      matchInfo.value = findMatchInfo;
    } else if (list.length > 0 && list[0].children.length > 0) {
      matchInfo.value = list[0].children[0];
    }
  }
});
</script>
<style lang="scss" scoped>
/* 主容器 */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #f0f2f5 100%);
}
.scroll {
  flex: 1;
  overflow: hidden;
  height: 100%;
  padding-bottom: 20rpx;
}
/* 赛事信息头部 */
.match-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 15rpx;
  margin-left: 30rpx;

  background-color: #e9ecef;

  .match-info {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;

    .match-info-left-team-tag {
      color: #999;
      font-size: 28rpx;
      margin-right: 8rpx;
    }

    .match-info-vs {
      margin: 0 20rpx;
      color: #666;
      font-size: 28rpx;
    }
  }

  .match-time {
    font-size: 24rpx;
    color: #888;
    margin-top: 4rpx;
  }
}
/* 表单主体 */
.create-prognosis-form {
  // padding: 24rpx 32rpx;
}
/* 卡片样式 */
.form-card {
  background: #fff;
  // border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}
/* 表单项 */
.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.form-item:last-child {
  margin-bottom: 0;
}
/* 标签样式 */
.form-label {
  display: flex;
  align-items: center;
  flex: 1;

  .label-icon {
    width: 8rpx;
    height: 32rpx;
    background: linear-gradient(180deg, #003aae 0%, #0057d9 100%);
    border-radius: 4rpx;
    margin-right: 16rpx;
  }

  .label-text {
    font-size: 38rpx;
    font-weight: 500;
    color: #333;
    display: flex;
    align-items: center;

    .label-sub {
      font-size: 28rpx;
      color: #999;
      margin-left: 8rpx;
      font-weight: 400;
    }
  }
}
/* 开关样式优化 */
.form-switch {
  transform: scale(1.1);
  margin-left: 16rpx;
}
/* 输入框样式 */
.form-input {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 38rpx;
  color: #333;
  transition: all 0.3s ease;

  &:focus {
    border-color: #007aff;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(0, 174, 29, 0.1);
  }
}
/* 内容区域 */
.form-item-content {
  margin-top: 16rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}
/* 价格输入 */
.price-input-wrapper {
  display: flex;
  align-items: center;

  .price-symbol {
    font-size: 36rpx;
    color: #ff6b35;
    font-weight: 600;
    margin-right: 8rpx;
  }

  .price-input {
    flex: 1;
    max-width: 300rpx;
  }

  .radio-label {
    margin-right: 14rpx;
  }
}
/* 选项按钮组（胜平负） */
.option-group {
  display: flex;
  gap: 20rpx;

  .option-btn {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
    color: #666;
    transition: all 0.3s ease;

    &.active {
      background: linear-gradient(135deg, #00ae1d 0%, #00d94a 100%);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 8rpx 24rpx rgba(0, 174, 29, 0.3);
      transform: translateY(-2rpx);
    }

    &:active:not(.active) {
      background: #e9ecef;
    }
  }
}
/* 文本域样式 */
.form-textarea {
  width: 100%;
  min-height: 300rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 38rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    border-color: #007aff;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(0, 174, 29, 0.1);
  }
}
/* 底部固定按钮 */
.fixed-bottom {
  background: #fff;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);

  .submit-btn {
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #007aff;
    border-radius: 48rpx;
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(0, 29, 174, 0.35);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 16rpx rgba(0, 20, 174, 0.3);
    }
  }
}
/* 弹窗样式 */
.data-picker-container {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;

  .data-picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .data-picker-header-cancel,
    .data-picker-header-confirm {
      font-size: 30rpx;
      color: #00ae1d;
      font-weight: 500;
      padding: 12rpx 24rpx;
    }

    .data-picker-header-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .picker-view {
    width: 750rpx;
    height: 480rpx;

    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      color: #333;
    }
  }
}
</style>
