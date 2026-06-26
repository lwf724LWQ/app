<template>
  <!-- 关注列表 -->
  <z-paging
    ref="swiperItemRef"
    :fixed="false"
    :auto="false"
    @query="onQuery"
  >
    <view class="area">
      <view v-for="(match, index) in matchInfoList" :key="index" class="day-group">
        <MatchScoreCard :match="match" />
      </view>
    </view>
  </z-paging>
</template>

<script setup>
import { ref, watch } from "vue";
import { forllowFootballList } from "@/api/apis";
import { getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import MatchScoreCard from "../components/MatchScoreCard.vue";

const swiperItemRef = ref(null);

const props = defineProps({
  pickerIndex: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    default: 20,
  },
  isActiveTab: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["video-click"]);

const matchInfoList = ref([]);
const isNeedRefresh = ref(false);
let firstLoaded = false;

// 监听 pickerIndex 懒加载
watch(
  () => props.pickerIndex,
  (newVal) => {
    if (newVal === 5 && !firstLoaded) {
      swiperItemRef.value?.reload();
    }
  },
  { immediate: true }
);

async function onQuery(pageNo, pageSize, from) {
  if (!getAccount()) {
    swiperItemRef.value?.complete([]);
    return;
  }
  try {
    const form = {
      page: pageNo,
      limit: pageSize,
    };

    const res = await forllowFootballList(form);

    if (res.code === 200 && res.data && Array.isArray(res.data.list)) {
      const list = res.data.list.map((item) => ({ ...item, flag: true }));
      if (pageNo === 1) {
        matchInfoList.value = [...list];
      } else {
        matchInfoList.value = [...matchInfoList.value, ...list];
      }
      userStore.setFollowCount(res.data.total);
    }

    swiperItemRef.value?.complete(matchInfoList.value);
    firstLoaded = true;
  } catch (error) {
    console.error("获取关注列表失败:", error);
    swiperItemRef.value?.complete([]);
    firstLoaded = true;
  }
}

function updateMatchList(list) {
  const newArr = [...matchInfoList.value];
  newArr.forEach((item, index) => {
    const a = list.find((newitem) => item.matchId == newitem.matchId);
    if (a) {
      newArr[index] = a;
    }
  });
  matchInfoList.value = newArr;
}

const userStore = useUserStore();

watch(
  () => props.videoType,
  () => {
    swiperItemRef.value?.reload();
  },
  { immediate: true }
);

function onshow() {
  if (isNeedRefresh.value) {
    swiperItemRef.value?.reload();
    isNeedRefresh.value = false;
  }
}

defineExpose({
  updateMatchList,
  refreshVideoList: () => swiperItemRef.value?.reload(),
  onshow,
});
</script>
<style lang="scss" scoped>
.area {
  padding: 10rpx;
  display: grid;
  grid-template-columns: 1fr;
  gap: 10rpx;
}
</style>