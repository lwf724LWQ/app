<template>
  <my-page :pageTitle="title">
    <image class="img" :src="img" mode="widthFix"></image>
  </my-page>
</template>

<script>
import myPage from "../../components/myPage.vue";
import tool from "../../utils/tool.js";
export default {
  components: { myPage },
  data() {
    return {
      title: "",
      issueno: "",
      img: "",
    };
  },
  onLoad(options) {
    this.title = options.title;
    this.issueno = options.issueno;
    this.img = tool.oss.getFullUrl(options.img);
  },
};
</script>

<style scoped>
.img {
  width: 100%;
}
</style>