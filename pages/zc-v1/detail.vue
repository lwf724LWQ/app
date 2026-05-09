<template>
  <view class="container">
    <matchHead :data="matchHeadData" />
    <template v-if="matchHeadData.matchId">
      <prognosisPage :matchId="matchHeadData.matchId" @openScratchCard="openScratchCard" />
    </template>
  </view>
</template>

<script setup>
import matchHead from "./components/match-head.vue";
import prognosisPage from "./detail-scroll-page/prognosis.vue";

import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getFootBallDetail } from "@/api/apis.js";

const matchHeadData = ref({});

onLoad((options) => {
  getFootBallDetail(options.id).then((res) => {
    matchHeadData.value = res.data;
  });
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
