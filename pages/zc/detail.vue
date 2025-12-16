<template>
  <view class="container">
    <TopNavigationBar bgColor="#222" color="#fff">
      <template #center>
        <view class="title-text">
          <text>江苏体彩女足</text>
          <text>VS</text>
          <text>萍乡体校女足</text>
        </view>
      </template>
    </TopNavigationBar>
    <scroll-view class="scroll-view" scroll-y>
      <matchHead />
      <pointTable />
      <detailTable />
      <detailTable />
      <dualAxis />
    </scroll-view>
  </view>
</template>

<script>
import TopNavigationBar from "../../components/TopNavigationBar.vue";
import detailTable from "./components/detail-table.vue";
import dualAxis from "./components/dual-axis.vue";
import pointTable from "./components/point-table.vue";
import matchHead from "./components/match-head.vue";
export default {
  components: {
    TopNavigationBar,
    detailTable,
    dualAxis,
    pointTable,
    matchHead,
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .title-text {
    display: flex;
    color: #fff;
    font-size: 26rpx;
    align-items: center;
    justify-content: center;
    > text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .scroll-view {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
}
</style>