import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDrawLineSettingStore = defineStore('drawLineSetting', () => {
  const options = ref({
    // 字号
    fontSize: 60,
    // 号码样式
    numberStyle: {
      isSolid: true,
      isRound: true
    },
    // 数字选择器
    numberPicker: true,
    // 底部行数
    bottomRow: 6,
    // 屏幕常亮
    keepScreenOn: false,
    // 主题：护眼
    theme: {
      column1: {
        backgroundColor: '#90c281',
        color: '#dfedbc'
      },
      column2: {
        backgroundColor: '#dfedbc',
        color: '#90c381'
      },
      column3: {
        backgroundColor: '#fefefc',
        color: '#90c281'
      },
      column4: {
        backgroundColor: '#dfedbc',
        color: '#90c281'
      },
      topBar: {
        backgroundColor: '#90c281',
        color: '#ffffff'
      },
      borderColor: '#88ae96'
    },
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
    colorType: 'single',
    // 线型：直线/上曲线/下曲线 straight/curveUp/curveDown
    lineType: 'straight'
  })

  const setOptions = (newOptions) => {
    options.value = newOptions
  }

  return { options, setOptions }
})
