import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { getStyleConfig } from "@/pages/juWang/peng-liao/drawLine/styleConfig";

export const useDrawLineSettingStore = defineStore("drawLineSetting", () => {
  const options = ref({
    // 字号
    fontSizeRatio: 1,
    // 号码样式
    numberStyle: {
      isSolid: true,
      isRound: true,
    },
    // 数字选择器
    numberPicker: true,
    // 固定字体
    fontFamily: "serif",
    // 底部行数
    bottomRow: 6,
    // 屏幕常亮
    keepScreenOn: false,
    // 主题：护眼
    theme: "护眼",
    // 显示期数
    showPeriod: 40,
    // 显示设置
    showSetting: true,
    // 拖拽点
    dragPoint: true,
    // 笔数
    count: 1,
    // 间隔
    distance: 0,
    // 单色/多色 single/multi
    colorType: "single",
    // 线型：直线/上曲线/下曲线 straight/curveUp/curveDown
    lineType: "straight",
    rowHeight: 110,
    // 是否首次进入
    isFirst: uni.getStorageSync("isFirst") || false,
  });
  let tmpNumberStyle = options.value.numberStyle;
  watch(
    () => options.value.theme,
    (newVal) => {
      options.value.rowHeight = newVal === "其他" ? 90 : 110;

      if (newVal === "其他") {
        tmpNumberStyle = options.value.numberStyle;
        options.value.numberStyle = {
          isSolid: false,
          isRound: true,
        };
      } else {
        options.value.numberStyle = tmpNumberStyle;
      }

      styleConfig.value = getStyleConfig(_type, newVal);
    }
  );

  const setOptions = (newOptions) => {
    options.value = newOptions;
  };

  const styleConfig = ref({});

  let _type;
  const setStyleConfig = (type, theme) => {
    _type = type;
    styleConfig.value = getStyleConfig(type, theme);
  };

  const changeIsFirst = () => {
    options.value.isFirst = true;
    uni.setStorage({
      key: "isFirst",
      data: true,
    });
  };

  return { options, setOptions, styleConfig, setStyleConfig, changeIsFirst };
});
