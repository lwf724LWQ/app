<template>
  <view class="bank-card-page">
    <view class="header">
      <text class="title">银行卡管理</text>
    </view>

    <view class="card-list">
      <view class="bank-card-item" v-for="(card, index) in bankCards" :key="card.id">
        <view class="card-info">
          <view class="bank-logo">
            <text class="bank-name">{{ card.bname }}</text>
          </view>
          <view class="card-number" v-if="card.bankNo">
            <text v-if="!card.hidden">{{ formatCardNumber(card.bankNo) }}</text>
            <text v-else>**** **** **** {{ card.bankNo.slice(-4) }}</text>
          </view>
          <view class="card-holder">
            <text>持卡人：{{ card.uname }}</text>
          </view>
        </view>
        <view class="card-actions">
          <view class="action-btn" @click="toggleCardVisibility(index)">
            <uni-icons
              :type="card.hidden ? 'eye-slash-filled' : 'eye-filled'"
              size="20"
              color="#fff"
            ></uni-icons>
          </view>
          <view class="action-btn delete" @click="deleteCard(card.id)">
            <uni-icons type="trash-filled" size="20" color="#fff"></uni-icons>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="bankCards.length === 0">
        <text class="empty-text">暂无银行卡</text>
        <text class="empty-hint">点击下方按钮添加银行卡</text>
      </view>
    </view>

    <view class="add-btn-container">
      <view class="add-btn" @click="openPopup">
        <uni-icons type="plus-filled" size="24" color="#fff"></uni-icons>
        <text class="add-text">添加银行卡</text>
      </view>
    </view>
    <Popup ref="popup" type="center">
      <view class="add-card-popup">
        <text class="popup-title">添加银行卡</text>
        <view class="form-item">
          <text class="label">银行名称</text>
          <picker class="picker" :range="bankList" :value="pickIndex" @change="onPickerChange">
            <view class="uni-input">{{ bankList[pickIndex] }}</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">银行卡号</text>
          <input class="input" placeholder="请输入银行卡号" type="number" v-model="bankNo" />
        </view>
        <view class="form-item">
          <text class="label">持卡人姓名</text>
          <input class="input" placeholder="请输入持卡人姓名" v-model="uname" />
        </view>
        <view class="popup-actions">
          <button class="cancel-btn" @click="popup.close()">取消</button>
          <button class="confirm-btn" @click="addCard">确认添加</button>
        </view>
      </view>
    </Popup>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { getUserBankListApi, addBankCardApi, deleteBankCardApi } from "@/api/apis";
import Popup from "@/components/Popup.vue";

const bankCards = ref([]);

const getBankCards = async () => {
  const response = await getUserBankListApi();
  bankCards.value = response.data.map((item) => {
    item.hidden = true;
    return item;
  });
};
getBankCards();

const formatCardNumber = (number) => {
  const parts = [];
  for (let i = 0; i < number.length; i += 4) {
    parts.push(number.slice(i, i + 4));
  }
  return parts.join(" ");
};

const toggleCardVisibility = (index) => {
  bankCards.value[index].hidden = !bankCards.value[index].hidden;
};

const deleteCard = (id) => {
  uni.showModal({
    title: "确认删除",
    content: "确定要删除这张银行卡吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteBankCardApi(id);
          uni.showToast({
            title: "删除成功",
            icon: "success",
          });
          await getBankCards();
        } catch {
          uni.showToast({
            title: "删除失败",
            icon: "none",
          });
        }
      }
    },
  });
};

const popup = ref(null);
const openPopup = () => {
  popup.value.open();
};

// 银行列表
const bankList = [
  "中国银行",
  "中国建设银行",
  "中国工商银行",
  "中国农业银行",
  "交通银行",
  "中国邮政储蓄银行",
  "招商银行",
  "中信银行",
  "上海浦东发展银行",
  "中国民生银行",
  "兴业银行",
  "中国光大银行",
  "华夏银行",
  "广发银行",
  "平安银行",
  "浙商银行",
  "恒丰银行",
  "渤海银行",
  "北京银行",
  "上海银行",
  "江苏银行",
  "宁波银行",
  "南京银行",
  "杭州银行",
  "盛京银行",
  "天津银行",
  "汉口银行",
];
const pickIndex = ref(0);
const onPickerChange = (e) => {
  pickIndex.value = e.detail.value;
};

const bname = computed(() => bankList[pickIndex.value]);
const bankNo = ref("");
const uname = ref("");
const addCard = async () => {
  if (!bankNo.value || !bname.value || !uname.value) {
    uni.showToast({
      title: "请填写完整信息",
      icon: "none",
    });
    return;
  }
  try {
    await addBankCardApi({ bankNo: bankNo.value, bname: bname.value, uname: uname.value });
    uni.showToast({
      title: "添加成功",
      icon: "success",
    });
    popup.value.close();
    getBankCards();
  } catch {
    uni.showToast({
      title: "添加失败",
      icon: "none",
    });
  }
};
</script>

<style lang="scss" scoped>
.bank-card-page {
  min-height: 100vh;
  background-color: #f7f7f7;
  padding: 20rpx 32rpx;
  padding-top: calc(20rpx + var(--status-bar-height));
}

.header {
  margin-bottom: 40rpx;

  .title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
  }
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 40rpx;
}

.bank-card-item {
  background-color: #667eea;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.card-info {
  flex: 1;
}

.bank-logo {
  margin-bottom: 20rpx;

  .bank-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
}

.card-number {
  margin-bottom: 16rpx;

  text {
    font-size: 36rpx;
    font-weight: 500;
    color: #fff;
    letter-spacing: 2rpx;
    font-family: "Courier New", monospace;
  }
}

.card-holder {
  text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.3);
  }

  &.delete {
    background: rgba(244, 67, 54, 0.3);

    &:active {
      background: rgba(244, 67, 54, 0.5);
    }
  }
}

.empty-state {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 80rpx 32rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

  .empty-text {
    display: block;
    font-size: 32rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .empty-hint {
    display: block;
    font-size: 24rpx;
    color: #ccc;
  }
}

.add-btn-container {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  padding: 0 32rpx;
}

.add-btn {
  background-color: #ffa726;
  border-radius: 50rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 167, 38, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(255, 167, 38, 0.3);
  }

  .add-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
}

.add-card-popup {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 600rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  .popup-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 40rpx;
  }

  .form-item {
    width: 100%;
    margin-bottom: 30rpx;

    .label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
      display: block;
    }

    .input,
    .uni-input {
      height: 80rpx;
      border: 2rpx solid #eee;
      border-radius: 12rpx;
      padding: 0 20rpx;
      font-size: 30rpx;
      color: #333;
    }

    .uni-input {
      line-height: 80rpx;
    }
  }

  .popup-actions {
    display: flex;
    gap: 20rpx;
    width: 100%;
    margin-top: 20rpx;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      &::after {
        border: 0;
      }
    }

    .cancel-btn {
      background-color: #e0e0e0;
      color: #666;
    }

    .confirm-btn {
      background-color: #ffa726;
      color: #fff;
    }
  }
}
</style>
