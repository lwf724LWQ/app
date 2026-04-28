<template>
  <view class="container">
    <top-navigation-bar>
      <template #center>
        <view class="match-content" @click="openDataPicker">
          <view class="match-info">
            <view class="match-info-left-team">
              <text class="match-info-left-team-tag">[主]</text>
              {{ matchInfo.htname }}
            </view>
            <view class="match-info-vs">VS</view>
            <view class="match-info-right-team">{{ matchInfo.atname }}</view>
            <uni-icons type="down" size="16" color="#000" />
          </view>
          <view class="match-time">{{ matchInfo.numStr }}</view>
        </view>
      </template>
    </top-navigation-bar>
    <scroll-view class="scroll" :scroll-y="true" :show-scrollbar="false">
      <!-- 创建预测方案的表单 -->
      <view class="create-prognosis-form">
        <!-- 标题 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">方案标题</text>
            </view>
            <input
              type="text"
              placeholder="请输入预测方案标题"
              class="form-input"
              v-model="form.title"
            />
          </view>
        </view>
        <!-- 观看价格 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">付费查看</text>
            </view>
            <view class="form-switch">
              <switch
                :checked="form.enablePrice"
                @change="form.enablePrice = $event.detail.value"
                color="#00ae1d"
              />
            </view>
          </view>
          <view class="form-item-content" v-if="form.enablePrice">
            <view class="price-input-wrapper">
              <text class="price-symbol">¥</text>
              <NumberInput v-model="form.price" :min="0.01" class="price-input" />
            </view>
          </view>
        </view>
        <!-- 胜负平 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">预测胜平负</text>
            </view>
            <view class="form-switch">
              <switch
                :checked="form.enableWinDrawLose"
                @change="form.enableWinDrawLose = $event.detail.value"
                color="#00ae1d"
              />
            </view>
          </view>
          <view class="form-item-content" v-show="form.enableWinDrawLose">
            <SelectBlock :options="winDrawLoseItem" v-model="form.winDrawLoseCurrent" />
          </view>
        </view>
        <!-- 让球胜平负 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">
                预测让球胜平负
                <text class="label-sub" v-if="matchInfo.goalLine">({{ matchInfo.goalLine }})</text>
              </text>
            </view>
            <view class="form-switch">
              <switch
                :checked="form.enableWinDrawLose_handicap"
                @change="form.enableWinDrawLose_handicap = $event.detail.value"
                color="#00ae1d"
              />
            </view>
          </view>
          <view class="form-item-content" v-show="form.enableWinDrawLose_handicap">
            <SelectBlock :options="winDrawLoseItem" v-model="form.winDrawLoseCurrent_handicap" />
          </view>
        </view>
        <!-- 半全场胜平负 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">预测半全场</text>
            </view>
            <view class="form-switch">
              <switch
                :checked="form.enableHalfTime"
                @change="form.enableHalfTime = $event.detail.value"
                color="#00ae1d"
              />
            </view>
          </view>
          <view class="form-item-content" v-show="form.enableHalfTime">
            <SelectBlock title="半全场" :options="halfTimeItem" v-model="form.halfTimeCurrent" />
          </view>
        </view>
        <!-- 总进球数 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">预测总进球数</text>
            </view>
            <view class="form-switch">
              <switch
                :checked="form.enableTotalGoals"
                @change="form.enableTotalGoals = $event.detail.value"
                color="#00ae1d"
              />
            </view>
          </view>
          <view class="form-item-content" v-show="form.enableTotalGoals">
            <SelectBlock
              title="总进球数"
              :options="totalGoalsItem"
              v-model="form.totalGoalsCurrent"
            />
          </view>
        </view>
        <!-- 比分 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">预测比分</text>
            </view>
            <view class="form-switch">
              <switch
                :checked="form.enableScore"
                @change="form.enableScore = $event.detail.value"
                color="#00ae1d"
              />
            </view>
          </view>
          <view class="form-item-content" v-show="form.enableScore">
            <SelectBlock title="比分" :options="scoreItem" v-model="form.scoreCurrent" />
          </view>
        </view>
        <!-- 专家分析 -->
        <view class="form-card">
          <view class="form-item">
            <view class="form-label">
              <view class="label-icon"></view>
              <text class="label-text">专家分析</text>
            </view>
          </view>
          <view class="form-item-content">
            <textarea
              class="form-textarea"
              v-model="form.expertAnalysis"
              placeholder="请输入详细的分析内容..."
              maxlength="1000"
            ></textarea>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="fixed-bottom">
      <view class="submit-btn" @click="submitPrognosis">提交预测</view>
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
import SelectBlock from "./components/select-block.vue";
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import { addFootBallPost } from "@/api/apis.js";
import NumberInput from "@/components/number-input.vue";
import { getFootBallNewList } from "@/api/apis.js";
import dayjs from "dayjs";
import { onLoad } from "@dcloudio/uni-app";

// 胜负平
const winDrawLoseItem = ref([
  { label: "胜", value: "胜" },
  { label: "平", value: "平" },
  { label: "负", value: "负" },
]);

// 半全场
const halfTimeItem = ref([
  { label: "胜胜", value: "胜胜" },
  { label: "胜平", value: "胜平" },
  { label: "胜负", value: "胜负" },
  { label: "平胜", value: "平胜" },
  { label: "平平", value: "平平" },
  { label: "平负", value: "平负" },
  { label: "负胜", value: "负胜" },
  { label: "负平", value: "负平" },
  { label: "负负", value: "负负" },
]);

// 总进球数
const totalGoalsItem = ref([
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7+", value: "7+" },
]);

// 比分
const scoreItem = ref([
  { label: "1:0", value: "1:0" },
  { label: "2:0", value: "2:0" },
  { label: "2:1", value: "2:1" },
  { label: "3:0", value: "3:0" },
  { label: "3:1", value: "3:1" },
  { label: "3:2", value: "3:2" },
  { label: "4:0", value: "4:0" },
  { label: "4:1", value: "4:1" },
  { label: "4:2", value: "4:2" },
  { label: "5:0", value: "5:0" },
  { label: "5:1", value: "5:1" },
  { label: "5:2", value: "5:2" },
  { label: "胜其他", value: "胜其他" },
  { label: "0:0", value: "0:0" },
  { label: "1:1", value: "1:1" },
  { label: "2:2", value: "2:2" },
  { label: "3:3", value: "3:3" },
  { label: "平其他", value: "平其他" },
  { label: "0:1", value: "0:1" },
  { label: "0:2", value: "0:2" },
  { label: "1:2", value: "1:2" },
  { label: "0:3", value: "0:3" },
  { label: "1:3", value: "1:3" },
  { label: "2:3", value: "2:3" },
  { label: "0:4", value: "0:4" },
  { label: "1:4", value: "1:4" },
  { label: "2:4", value: "2:4" },
  { label: "0:5", value: "0:5" },
  { label: "1:5", value: "1:5" },
  { label: "2:5", value: "2:5" },
  { label: "负其他", value: "负其他" },
]);

const matchInfo = ref({});
const form = reactive({
  enableWinDrawLose: false,
  enableWinDrawLose_handicap: false,
  enableHalfTime: false,
  enableTotalGoals: false,
  enableScore: false,
  winDrawLoseCurrent: winDrawLoseItem.value[0].value,
  winDrawLoseCurrent_handicap: winDrawLoseItem.value[0].value,
  halfTimeCurrent: halfTimeItem.value[0].value,
  totalGoalsCurrent: totalGoalsItem.value[0].value,
  scoreCurrent: scoreItem.value[0].value,

  enablePrice: false,
  price: 10,

  expertAnalysis: "",
});

const dataTree = ref([]);
const matchList = ref([]);
const pickerValue = ref([]);
const dataPicker = ref(null);
const pickerViewVisible = ref(false);
const indicatorStyle = ref(`height: 50px;`);
const temp_matchInfo = ref({});
// 打开赛事选择框
function openDataPicker() {
  // 将当前的matchInfo转化为picker能使用的value
  const index1 = dataTree.value.findIndex((item) => item.value === matchInfo.value.fdate);
  const index2 = matchList.value.findIndex((item) => item.value === matchInfo.value.matchId);
  pickerValue.value = [index1, index2];

  // 防止picker无法撑开，先弹出popup再显示picker
  pickerViewVisible.value = false;
  dataPicker.value.open();
  nextTick(() => {
    pickerViewVisible.value = true;
  });
}
// 确认选择赛事
function confirmDataPicker() {
  matchInfo.value = temp_matchInfo.value;
  checkMatchIsHaveGoalLine();
  dataPicker.value.close();
}
// 关闭选择赛事弹框
function closeDataPicker() {
  dataPicker.value.close();
}

function bindChangeMatch(e) {
  const [day, matchInfo] = e.detail.value;
  matchList.value = dataTree.value[day].children;
  temp_matchInfo.value = matchList.value[matchInfo];
}

async function submitPrognosis() {
  const resultForm = {
    expertAnalysis: form.expertAnalysis,
  };

  // 只提交启用的预测
  if (form.enableWinDrawLose) {
    resultForm.winDrawLosecurrent = form.winDrawLoseCurrent;
    // resultForm.winDrawLoseCurrent_res = "胜负平预测结果";
  }
  if (form.enableWinDrawLose_handicap) {
    resultForm.winDrawLosecurrentHandicap = `(${matchInfo.value.goalLine.substr(0, 2)})${
      form.winDrawLoseCurrent_handicap
    }`;
    // resultForm.winDrawLoseCurrent_handicap_res = "让球胜负平预测结果";
  }
  if (form.enableHalfTime) {
    resultForm.halfTimecurrent = form.halfTimeCurrent;
    // resultForm.halfTimeCurrent_res = "半全场预测结果";
  }
  if (form.enableTotalGoals) {
    resultForm.totalGoalscurrent = form.totalGoalsCurrent;
    // resultForm.totalGoalsCurrent_res = "总分预测结果";
  }
  if (form.enableScore) {
    resultForm.scorecurrent = form.scoreCurrent;
    // resultForm.scoreCurrent_res = "比分预测结果";
  }
  const confirmForm = {
    matchId: matchInfo.value.matchId,
    title: form.title,

    // 预测价格
    price: form.enablePrice ? form.price : 0,
    flag: form.enablePrice,

    // 预测结果
    result: JSON.stringify(resultForm),
  };

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

async function getMatchData() {
  try {
    uni.showLoading({ title: "加载中..." });
    const res = await getFootBallNewList();
    let newArr = [];
    res.data.forEach((match) => {
      const mL = newArr.find((item) => item.businessDate === match.fdate);
      match = { ...match, text: `${match.htname} vs ${match.atname}`, value: match.matchId };
      if (mL) {
        mL.children.push(match);
        mL.matchCount++;
        return;
      } else {
        newArr.push({
          businessDate: match.fdate,
          weekday: dayjs(match.fdate).format("dddd"),
          text: dayjs(match.fdate).format("dddd"),
          value: match.fdate,
          matchCount: 1,
          children: [match],
        });
      }
    });
    newArr = newArr.sort(
      (a, b) => new Date(a.businessDate).getTime() - new Date(b.businessDate).getTime()
    );
    console.log(newArr);
    dataTree.value = newArr;
    matchList.value = newArr[0].children;
  } catch (error) {
    console.error("获取比赛数据失败:", error);
    uni.showToast({ title: "获取比赛数据失败", icon: "none" });
  }
  uni.hideLoading();

  // 请求头两天的数据
  // const fdateStr_day1 = dayjs().format("YYYY-MM-DD");
  // const fdateStr_day2 = dayjs().add(1, "day").format("YYYY-MM-DD");
  // const [day1_res, day2_res] = await Promise.all([
  //   getFootBallList(fdateStr_day1),
  //   getFootBallList(fdateStr_day2),
  // ]);

  // const newDataTree = [];
  // if (day1_res?.data?.length) pushData(fdateStr_day1, day1_res.data);
  // if (day2_res?.data?.length) pushData(fdateStr_day2, day2_res.data);

  // dataTree.value = newDataTree;
  // matchList.value = newDataTree[0].children;

  // function pushData(datastr, list) {
  //   newDataTree.push({
  //     text: dayjs(datastr).format("dddd"),
  //     value: datastr,
  //     children: list.map((item) => ({
  //       ...item,
  //       text: `${item.htname} vs ${item.atname}`,
  //       value: item.matchId,
  //     })),
  //   });
  // }
}

async function init() {
  try {
    await getMatchData();
  } catch (e) {
    console.log(e);
    uni.showModal({
      title: e.msg || "获取数据失败",
    });
  }
}

function checkMatchIsHaveGoalLine() {
  if (!matchInfo.value.goalLine) {
    uni.showModal({
      title: "提示",
      content: "该赛事体彩玩法细节未公开，暂不支持预测",
      showCancel: false,
      confirmText: "返回",
      success: (res) => {
        if (res.confirm) {
          uni.navigateBack();
        }
      },
    });
  }
}

onLoad((option) => {
  console.log(option);
  matchInfo.value = { matchId: option.matchId, goalLine: "+1.00" };
  init().then(() => {
    // 这里从列表查到指定的赛事信息
    const findMatchInfo = dataTree.value
      .reduce((acc, cur) => {
        return acc.concat(cur.children);
      }, [])
      .find((item) => item.matchId === option.matchId);

    // if (!findMatchInfo) {
    //   uni.showModal({
    //     title: "提示",
    //     content: "当前赛事已不能预测",
    //     showCancel: false,
    //     confirmText: "返回",
    //     success: (res) => {
    //       if (res.confirm) {
    //         uni.navigateBack();
    //       }
    //     },
    //   });
    //   return;
    // }

    // matchInfo.value = findMatchInfo;
    checkMatchIsHaveGoalLine();
  });
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
  justify-content: center;
  padding: 8rpx 0;

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
  padding: 24rpx 32rpx;
}
/* 卡片样式 */
.form-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
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
    background: linear-gradient(180deg, #00ae1d 0%, #00d94a 100%);
    border-radius: 4rpx;
    margin-right: 16rpx;
  }

  .label-text {
    font-size: 32rpx;
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
  max-width: 400rpx;
  height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #333;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00ae1d;
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
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    border-color: #00ae1d;
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
    background: linear-gradient(135deg, #00ae1d 0%, #00d94a 100%);
    border-radius: 48rpx;
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(0, 174, 29, 0.35);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 16rpx rgba(0, 174, 29, 0.3);
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
