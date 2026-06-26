<template>
  <view class="editor" :class="{ isReady: editorCtx }">
    <view class="toolbar" v-if="!props.readOnly">
      <view
        class="toolbar-btn"
        :class="{ active: modeConfig['bold'] }"
        @click="toggleTextMode('bold')"
      >
        <text class="toolbar-icon bold">B</text>
      </view>
      <view
        class="toolbar-btn"
        :class="{ active: modeConfig['italic'] }"
        @click="toggleTextMode('italic')"
      >
        <text class="toolbar-icon italic">I</text>
      </view>
      <view
        class="toolbar-btn"
        :class="{ active: modeConfig['underline'] }"
        @click="toggleTextMode('underline')"
      >
        <text class="toolbar-icon underline">U</text>
      </view>
      <view
        class="toolbar-btn"
        :class="{ active: modeConfig['strike'] }"
        @click="toggleTextMode('strike')"
      >
        <text class="toolbar-icon strike">S</text>
      </view>
      <view class="toolbar-divider"></view>
      <view class="toolbar-btn header-btn" @click="toggleHeader('H1')">
        <text class="toolbar-icon">H1</text>
      </view>
      <view class="toolbar-btn header-btn" @click="toggleHeader('H2')">
        <text class="toolbar-icon">H2</text>
      </view>
      <view class="toolbar-btn header-btn" @click="toggleHeader('H3')">
        <text class="toolbar-icon">H3</text>
      </view>
      <view class="toolbar-divider"></view>
      <view
        class="toolbar-btn color-btn"
        :class="{ active: modeConfig['color'] }"
        @click="toggleColor"
      >
        <text class="toolbar-icon color-icon">A</text>
      </view>
      <view class="toolbar-divider"></view>
      <view class="toolbar-btn img-btn" @click="insertImage">
        <text class="toolbar-icon">🖼</text>
      </view>
    </view>
    <editor
      v-show="!props.readOnly"
      id="editor"
      class="ql-container"
      placeholder="开始输入..."
      show-img-size
      show-img-toolbar
      show-img-resize
      @statuschange="onStatusChange"
      :read-only="props.readOnly"
      @ready="onEditorReady"
    ></editor>

    <rich-text v-show="props.readOnly" :nodes="htmlString" class="editor-readonly-view"></rich-text>
  </view>
</template>
<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { ref, defineEmits, defineProps, watch } from "vue";
import tool from "@/utils/tool.js";

const editorCtx = ref(null);
const htmlString = ref("");

const useEmit = defineEmits(["onReady"]);
const props = defineProps(["readOnly"]);

// 缓存在编辑器未初始化时传入的 setContents 参数
const pendingSetContentsOptions = ref(null);

// 监听初始化完成
function onEditorReady() {
  // #ifdef APP-PLUS || MP-WEIXIN || H5
  uni
    .createSelectorQuery()
    .select("#editor")
    .context((res) => {
      editorCtx.value = res.context;
      // 如果有待处理的 setContents 调用，初始化后立即执行
      if (pendingSetContentsOptions.value) {
        const opts = pendingSetContentsOptions.value;
        pendingSetContentsOptions.value = null;
        setContents(opts);
      }
      useEmit("onReady");
    })
    .exec();
  // #endif
}

function insertImage() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      editorCtx.value.insertImage({
        src: res.tempFilePaths[0],
        alt: "图像",
        success: function () {
          console.log("insert image success");
        },
      });
    },
  });
}

const modeConfig = ref({
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  header: "",
  color: false,
});

function toggleTextMode(mode) {
  const now = modeConfig.value[mode];
  editorCtx.value.format(mode, !now);
  modeConfig.value[mode] = !now;
}

function toggleHeader(level) {
  const now = modeConfig.value["header"];
  if (now === level) {
    // 再次点击同一级标题 → 取消标题（还原为正文）
    editorCtx.value.format("header", false);
    modeConfig.value["header"] = "";
  } else {
    editorCtx.value.format("header", level);
    modeConfig.value["header"] = level;
  }
}

function toggleColor() {
  const now = modeConfig.value["color"];
  if (now) {
    editorCtx.value.format("color", false);
  } else {
    editorCtx.value.format("color", "#F00");
  }
  modeConfig.value["color"] = !now;
}

/**
 * 设置编辑器内容
 * @param {Object} options - { html?, delta?, success?, fail?, complete? }
 * @returns {Promise}
 */
function setContents(options = {}) {
  return new Promise(async (resolve, reject) => {
    if (!editorCtx.value) {
      // 编辑器尚未初始化，缓存参数，待 onEditorReady 中重试
      pendingSetContentsOptions.value = options;
      // 不 reject，静默等待初始化完成后自动调用
      resolve();
      return;
    }

    let opt = {};
    if (typeof options !== "object") {
      opt.html = String(options);
    } else {
      opt = await handleDeltaWtihSet(options);
    }
    editorCtx.value.setContents({
      ...opt,
      success: (res) => {
        options.success && options.success(res);
        options.complete && options.complete(res);
        resolve(res);

        getContents().then((res) => {
          htmlString.value = res.html;
        });
      },
      fail: (err) => {
        options.fail && options.fail(err);
        options.complete && options.complete(err);
        reject(err);
      },
    });
  });
}

/**
 * 获取编辑器内容
 * @param {Object} options - { success?, fail?, complete? }
 * @returns {Promise<{html: string, text: string, delta: Object}>}
 */
function getContents(options = {}) {
  return new Promise((resolve, reject) => {
    if (!editorCtx.value) {
      reject(new Error("editorCtx 尚未初始化"));
      return;
    }
    editorCtx.value.getContents({
      success: async (res) => {
        uni.showLoading("上传图片中");
        // 这里上传图片
        try {
          await handleDeltaWtihGet(res.delta);
        } catch (error) {
          uni.showToast({ title: "上传图片失败", icon: "none" });
          uni.hideLoading();
          reject(new Error("上传图片失败"));
          return;
        }

        console.log(res.delta);
        options.success && options.success(res);
        options.complete && options.complete(res);
        resolve(res);

        uni.hideLoading();
      },
      fail: (err) => {
        options.fail && options.fail(err);
        options.complete && options.complete(err);
        reject(err);
      },
    });
  });
}

async function handleDeltaWtihSet(option) {
  const delta = option.delta;
  for (let index = 0; index < delta.ops.length; index++) {
    const element = delta.ops[index];
    if (element.insert && element.insert.image && element.attributes) {
      // 上传图片
      const a = tool.oss.getFullUrl(element.insert.image);
      element.insert.image = a;
      element.attributes["data-local"] = a;
    }
  }
  return option;
}

async function handleDeltaWtihGet(delta) {
  for (let index = 0; index < delta.ops.length; index++) {
    const element = delta.ops[index];
    if (element.insert && element.insert.image && element.attributes) {
      // 上传图片
      const a = await uploadImg(element.insert.image);
      element.insert.image = a;
      element.attributes["data-local"] = a;
    }
  }
  return delta;
}

// 上传图片
async function uploadImg(url) {
  // 已经上传了的就不上传了
  if (url.startsWith("editerImg") || url.startsWith("/editerImg")) {
    return url;
  }
  if (url.startsWith("http")) {
    const i = url.indexOf("editerImg");
    return url.slice(i);
  }
  return await tool.oss.uploadImgForTempPath(url, "editerImg");
}

defineExpose({
  setContents,
  getContents,
});
</script>
<style lang="scss">
.editor {
  position: relative;

  &::after {
    position: absolute;
    content: "加载中";
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    line-height: 400rpx;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 10;
  }
  &.isReady::after {
    animation: closeMask 0.5s ease forwards;
    pointer-events: none;
  }

  @keyframes closeMask {
    0% {
      opacity: 1;
    }
    99% {
      opacity: 0;
    }
    100% {
      opacity: 0;
      display: none;
    }
  }
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  flex-wrap: wrap;
  gap: 4rpx;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
  position: relative;

  &:active {
    transform: scale(0.92);
    background-color: #f0f0f0;
  }

  &.active {
    background-color: #2b6de8;

    .toolbar-icon {
      color: #fff;
    }
  }
}

.toolbar-icon {
  font-size: 28rpx;
  color: #333;
  line-height: 1;
  transition: color 0.2s ease;

  &.bold {
    font-weight: bold;
  }

  &.italic {
    font-style: italic;
    font-family: Georgia, serif;
  }

  &.underline {
    text-decoration: underline;
  }

  &.strike {
    text-decoration: line-through;
  }
}

.toolbar-divider {
  width: 2rpx;
  height: 32rpx;
  background-color: #ddd;
  margin: 0 8rpx;
}

.color-btn {
  .color-icon {
    color: #f00;
    font-weight: bold;
  }

  &.active {
    background-color: #f00;

    .color-icon {
      color: #fff;
    }
  }
}

.img-btn {
  width: auto;
  padding: 0 12rpx;

  .toolbar-icon {
    font-size: 32rpx;
  }
}

.editor-readonly-view {
  & :deep(img) {
    max-width: 100%;
  }
}
</style>
