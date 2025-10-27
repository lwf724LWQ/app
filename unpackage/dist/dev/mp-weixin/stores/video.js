"use strict";
const common_vendor = require("../common/vendor.js");
const useVideoStore = common_vendor.defineStore("video", {
  state: () => ({
    currentVideo: null
  }),
  actions: {
    setCurrentVideo(video) {
      this.currentVideo = video;
      common_vendor.index.__f__("log", "at stores/video.js:12", video, "这是仓库中的");
    },
    clearCurrentVideo() {
      this.currentVideo = null;
    }
  },
  getters: {
    getCurrentVideo: (state) => state.currentVideo
  }
});
exports.useVideoStore = useVideoStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/video.js.map
