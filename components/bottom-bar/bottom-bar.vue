<!-- components/BottomTabBar.vue -->
<template>
  <view :class="{ oldManMode: useOldManModeStore.enabled }" v-if="false">
    <view class="tab-bar-reserved-grid"></view>
    <view class="tab-bar">
      <view
        class="tab-item"
        v-for="(item, index) in tabList"
        :key="index"
        @click="switchTab(item.path)"
      >
        <uni-icons
          v-if="item.uniicon"
          :type="item.uniicon"
          :size="useOldManModeStore.enabled ? '34' : '22'"
          :color="currentPath === item.path ? '#f70000' : '#666666'"
        ></uni-icons>
        <image
          v-else
          :src="currentPath === item.path ? item.selectedIcon : item.icon"
          class="tab-icon"
        ></image>
        <text :class="['tab-text', currentPath === item.path ? 'active' : '']">
          {{ item.text }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 注意要在pages.json中也配置相应页面
 * 否则不能正常跳转
 */
import homeimg from "./tabBar/home.png";
import homeselectimg from "./tabBar/home-h.png";
import zc from "./tabBar/zc.png";
import zcselectimg from "./tabBar/zc-h.png";
import classifyimg from "./tabBar/classify.png";
import classifyselectimg from "./tabBar/classify-h.png";
import userimg from "./tabBar/user.png";
import userselectimg from "./tabBar/user-h.png";
import videoimg from "./tabBar/video.png";
import videoselectimg from "./tabBar/video-h.png";
export default {
  name: "BottomTabBar",
  props: {
    // 当前路由路径
    currentPath: {
      type: String,
      required: true,
    },
  },
  inject: ["useOldManModeStore"],
  data() {
    return {
      tabList: [
        {
          text: "首页",
          path: "/pages/index/index",
          uniicon: "home",
          icon: homeimg,
          selectedIcon: homeselectimg,
        },
        // {
        //   text: "体彩",
        //   path: "/pages/zc/index",
        //   icon: zc,
        //   selectedIcon: zcselectimg,
        // },
        // {
        //   text: "视频",
        //   path: "/pages/video/video",
        //   uniicon: "videocam",
        //   icon: videoimg,
        //   selectedIcon: videoselectimg,
        // },
        {
          text: "彩友圈",
          path: "/pages/forum/forum",
          uniicon: "pyq",
          icon: classifyimg,
          selectedIcon: classifyselectimg,
        },
        {
          text: "我的",
          path: "/pages/user/user",
          uniicon: "person",
          icon: userimg,
          selectedIcon: userselectimg,
        },
      ],
    };
  },
  methods: {
    switchTab(path) {
      if (this.currentPath !== path) {
        console.log(path);
        uni.switchTab({
          url: path,
        });
      }
    },
  },
  created() {
    uni.hideTabBar();
  },
};
</script>

<style scoped lang="scss">
.oldManMode {
  .tab-bar-reserved-grid {
    /* 占位用 */
    height: 100rpx;
  }

  .tab-bar {
    height: 100rpx;
  }

  .tab-text {
    font-size: 30rpx;
  }
}

.tab-bar-reserved-grid {
  /* 占位用 */
  height: 90rpx;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  /* 50px * 2 = 100rpx */
  background-color: #ffffff;
  display: flex;
  border-top: 2rpx solid #e5e5e5;
  /* 1px * 2 = 2rpx */
  z-index: 9;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tab-icon {
  width: 48rpx;
  /* 24px * 2 = 48rpx */
  height: 48rpx;
  /* 24px * 2 = 48rpx */
  margin-bottom: 4rpx;
  /* 2px * 2 = 4rpx */
}

.tab-text {
  font-size: 22rpx;
  font-weight: bold;
  /* 12px * 2 = 24rpx */
  color: #666666;
}

.tab-text.active {
  color: #f70000;
}
</style>
