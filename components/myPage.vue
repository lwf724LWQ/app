<template>
  <view class="container-eqwejoj12123fsf">
    <top-navigation-bar :title="pageTitle" v-if="pageTitle" />
    <scroll-view class="scroll" :scroll-y="true" :show-scrollbar="false" @scrolltolower="onReachBottom"
    :lower-threshold="150">
      <slot></slot>
    </scroll-view>
  </view>
</template>

<script>
import TopNavigationBar from "@/components/TopNavigationBar.vue";
export default {
  components: {
    TopNavigationBar,
  },
  props: {
    pageTitle: { type: String, default: "" },
  },
  methods: {
    onReachBottom(e){
      this.$emit("onReachBottom", e)
    }
  }
};
</script>

<style scoped>
.container-eqwejoj12123fsf {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.scroll {
  flex: 1;
  overflow: hidden;
  height: 100%;
}
</style>
