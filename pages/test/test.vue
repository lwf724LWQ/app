<template>
  <view>
    <view @click="initwx">21</view>
  </view>
</template>

<script>
import appPay from "../../utils/uniwxsdk/app.ts";
// import h5 from '../../utils/uniwxsdk/h5';
// import tool from "../../utils/tool"
export default {
  data() {
    return {};
  },
  methods: {
    initwx() {
		console.log("213123")
      appPay.pay("123", "123");
    },
  },
};
</script>

<style></style>
