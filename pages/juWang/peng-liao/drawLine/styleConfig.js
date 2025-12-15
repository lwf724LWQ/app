const systemInfo = uni.getSystemInfoSync()
let ratio = systemInfo.screenWidth / 750

// const layoutType = 'other'
// const theme = '护眼'
const layouts = {
  plw: [
    {
      left: 0,
      right: 153 * ratio,
      border: 7 * ratio,
      width: 153 * ratio,
      fontSize: [30 * ratio, 23 * ratio]
    },
    {
      left: 160 * ratio,
      right: 223 * ratio,
      border: 7 * ratio,
      width: 63 * ratio,
      fontSize: 40 * ratio,
      markType: 'simple'
    },
    {
      left: 230 * ratio,
      right: 332 * ratio,
      border: 1 * ratio,
      width: 102 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 333 * ratio,
      right: 435 * ratio,
      border: 1 * ratio,
      width: 102 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 436 * ratio,
      right: 538 * ratio,
      border: 1 * ratio,
      width: 102 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 539 * ratio,
      right: 641 * ratio,
      border: 7 * ratio,
      width: 102 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 648 * ratio,
      right: 750 * ratio,
      border: 0,
      width: 102 * ratio,
      fontSize: 60 * ratio,
      markType: 'number'
    }
  ],
  // 193+7+94+7+149+1+149+1+149
  fc3d: [
    {
      left: 0,
      right: 193 * ratio,
      border: 7 * ratio,
      width: 193 * ratio,
      fontSize: [30 * ratio, 23 * ratio]
    },
    {
      left: 200 * ratio,
      right: 294 * ratio,
      border: 7 * ratio,
      width: 94 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 301 * ratio,
      right: 450 * ratio,
      border: 1 * ratio,
      width: 149 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 451 * ratio,
      right: 600 * ratio,
      border: 1 * ratio,
      width: 149 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 601 * ratio,
      right: 750 * ratio,
      border: 0,
      width: 149 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    }
  ],
  // 140+7+50+7+90+1+90+1+90+1+90+7+58+1+58+1+58
  qxc: [
    {
      left: 0,
      right: 140 * ratio,
      border: 7 * ratio,
      width: 140 * ratio,
      fontSize: [30 * ratio, 23 * ratio]
    },
    {
      left: 147 * ratio,
      right: 197 * ratio,
      border: 7 * ratio,
      width: 50 * ratio,
      fontSize: 30 * ratio,
      markType: 'simple'
    },
    {
      left: 204 * ratio,
      right: 294 * ratio,
      border: 1 * ratio,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 295 * ratio,
      right: 385 * ratio,
      border: 1 * ratio,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 386 * ratio,
      right: 476 * ratio,
      border: 1 * ratio,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 477 * ratio,
      right: 567 * ratio,
      border: 7 * ratio,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 574 * ratio,
      right: 632 * ratio,
      border: 1 * ratio,
      width: 58 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 633 * ratio,
      right: 691 * ratio,
      border: 1 * ratio,
      width: 58 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 692 * ratio,
      right: 750 * ratio,
      border: 0,
      width: 58 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    }
  ],
  //81+1+109+109+109+109+1+81+150
  'other-plw': [
    {
      left: 0,
      right: 81 * ratio,
      border: 1 * ratio,
      width: 81 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 82 * ratio,
      right: 191 * ratio,
      border: 0,
      width: 109 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 191 * ratio,
      right: 300 * ratio,
      border: 0,
      width: 109 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 300 * ratio,
      right: 409 * ratio,
      border: 0,
      width: 109 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 409 * ratio,
      right: 518 * ratio,
      border: 1 * ratio,
      width: 109 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 519 * ratio,
      right: 600 * ratio,
      border: 1 * ratio,
      width: 81 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    }
  ],
  //122+1+159+159+159+150
  'other-fc3d': [
    {
      left: 0,
      right: 122 * ratio,
      border: 1 * ratio,
      width: 122 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 123 * ratio,
      right: 282 * ratio,
      border: 0,
      width: 159 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 282 * ratio,
      right: 441 * ratio,
      border: 0,
      width: 159 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 441 * ratio,
      right: 600 * ratio,
      border: 1 * ratio,
      width: 159 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    }
  ],
  // 59.5+1+90+90+90+90+1+59.5+59.5+59.5+150
  'other-qxc': [
    {
      left: 0,
      right: 59.5 * ratio,
      border: 1 * ratio,
      width: 59.5 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 60.5 * ratio,
      right: 150.5 * ratio,
      border: 0,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 150.5 * ratio,
      right: 240.5 * ratio,
      border: 0,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 240.5 * ratio,
      right: 330.5 * ratio,
      border: 0,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 330.5 * ratio,
      right: 420.5 * ratio,
      border: 1 * ratio,
      width: 90 * ratio,
      fontSize: 60 * ratio,
      markType: 'senior'
    },
    {
      left: 421.5 * ratio,
      right: 481 * ratio,
      border: 0,
      width: 59.5 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 481 * ratio,
      right: 540.5 * ratio,
      border: 0,
      width: 59.5 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    },
    {
      left: 540.5 * ratio,
      right: 600 * ratio,
      border: 1 * ratio,
      width: 59.5 * ratio,
      fontSize: 50 * ratio,
      markType: 'simple'
    }
  ]
}

const themes = {
  plw: {
    经典: {
      column: [
        { backgroundColor: '#3a4e33', color: '#f6f6f6' },
        { backgroundColor: '#f1f1ef', color: '#898989' },
        { backgroundColor: '#ffffff', color: '#898989' },
        { backgroundColor: '#f1f1ef', color: '#bfbdbe' }
      ],
      topBar: { backgroundColor: '#898989', color: '#ffffff' },
      borderColor: '#dddddd'
    },
    护眼: {
      column: [
        { backgroundColor: '#90c281', color: '#dfedbc' },
        { backgroundColor: '#dfedbc', color: '#90c381' },
        { backgroundColor: '#fefefc', color: '#90c281' },
        { backgroundColor: '#dfedbc', color: '#90c281' }
      ],
      topBar: { backgroundColor: '#90c281', color: '#ffffff' },
      borderColor: '#88ae96'
    },
    夜间: {
      column: [
        { backgroundColor: '#2a2a2a', color: '#898989' },
        { backgroundColor: '#2a2a2a', color: '#898989' },
        { backgroundColor: '#2a2a2a', color: '#ffffff' },
        { backgroundColor: '#2a2a2a', color: '#898989' }
      ],
      topBar: { backgroundColor: '#2a2a2a', color: '#ffffff' },
      borderColor: '#4e4e4e'
    },
    怀旧: {
      column: [
        { backgroundColor: '#f75b69', color: '#000001' },
        { backgroundColor: '#000001', color: '#ffffff' },
        { backgroundColor: '#ffffff', color: '#000000' },
        { backgroundColor: '#f0eff5', color: '#000000' }
      ],
      topBar: { backgroundColor: '#39383e', color: '#ffffff' },
      borderColor: '#39383e'
    },
    鸿运: {
      column: [
        { backgroundColor: '#fc3d44', color: '#fff5f4' },
        { backgroundColor: '#fff5f4', color: '#fc3d44' },
        { backgroundColor: '#ffffff', color: '#fc3d44' },
        { backgroundColor: '#fff5f4', color: '#000000' }
      ],
      topBar: { backgroundColor: '#fc3d44', color: '#fffcfc' },
      borderColor: '#fc3d43'
    },
    金玉: {
      column: [
        { backgroundColor: '#ff9f00', color: '#fef9f2' },
        { backgroundColor: '#fefaf1', color: '#f8a00e' },
        { backgroundColor: '#ffffff', color: '#ff9f00' },
        { backgroundColor: '#fefaf1', color: '#ff9f00' }
      ],
      topBar: { backgroundColor: '#ff9f00', color: '#ffffff' },
      borderColor: '#e08d00'
    },
    素棕: {
      column: [
        { backgroundColor: '#f5eee8', color: '#a29795' },
        { backgroundColor: '#fef9f5', color: '#a29795' },
        { backgroundColor: '#ffffff', color: '#4e2768' },
        { backgroundColor: '#fef9f5', color: '#a29795' }
      ],
      topBar: { backgroundColor: '#d3c7b7', color: '#3d3b39' },
      borderColor: '#d3c7b7'
    },
    金黄: {
      column: [
        { backgroundColor: '#f7f5df', color: '#d1aa81' },
        { backgroundColor: '#8b6a3f', color: '#ffffff' },
        { backgroundColor: '#ffda21', color: '#8b6a3f' },
        { backgroundColor: '#f7f5df', color: '#d1aa81' }
      ],
      topBar: { backgroundColor: '#8b6a3f', color: '#bfbdbe' },
      borderColor: '#e2d8cb'
    },
    浅蓝: {
      column: [
        { backgroundColor: '#f2f6ff', color: '#929fb0' },
        { backgroundColor: '#cedef5', color: '#929fb0' },
        { backgroundColor: '#ffffff', color: '#4a5060' },
        { backgroundColor: '#f2f6ff', color: '#929fb1' }
      ],
      topBar: { backgroundColor: '#cedef5', color: '#3a3d3f' },
      borderColor: '#b0bfd3'
    }
  },
  fc3d: {},
  qxc: {}
}

// 复制不同布局主题
!(function () {
  const plw = themes.plw
  for (const themeKey in plw) {
    const theme = plw[themeKey]
    const obj = {}
    obj.topBar = theme.topBar
    obj.borderColor = theme.borderColor
    obj.column = [...theme.column]
    obj.column.splice(3, 1)
    themes.fc3d[themeKey] = obj
  }
  for (const themeKey in plw) {
    const theme = plw[themeKey]
    const obj = {}
    obj.topBar = theme.topBar
    obj.borderColor = theme.borderColor
    obj.column = [...theme.column]
    themes.qxc[themeKey] = obj
  }
})()

// 添加样式相同的列的配置
for (const layoutKey in themes) {
  const layout = themes[layoutKey]
  for (const themeKey in layout) {
    const column = layout[themeKey].column
    if (layoutKey === 'plw') {
      const item = column[2]
      column.splice(3, 0, item, item, item)
    }
    if (layoutKey === 'fc3d') {
      const item = column[2]
      column.splice(3, 0, item, item)
    }
    if (layoutKey === 'qxc') {
      column.splice(4, 0, column[3], column[3])
      column.splice(3, 0, column[2], column[2], column[2])
    }
  }
}

export const getStyleConfig = (type, theme) => {
  const typeMap = {
    排列五: 'plw',
    福彩3D: 'fc3d',
    七星彩: 'qxc'
  }
  let layoutType = typeMap[type]
  if (theme === '其他') layoutType = `other-${layoutType}`

  const borderColor = themes[layoutType]?.[theme].borderColor || '#4e4e4e'
  const topBar = themes[layoutType]?.[theme].topBar || {
    backgroundColor: '#ffffff',
    color: '#4e4e4e'
  }

  let numberStartIndex = 1
  if (theme === '其他') numberStartIndex = 0

  const columns = layouts[layoutType]
  columns.forEach((item, index) => {
    let backgroundColor = themes[layoutType]?.[theme].column[index].backgroundColor || '#ffffff'
    let color = themes[layoutType]?.[theme].column[index].color || '#4e4e4e'

    item.backgroundColor = backgroundColor
    item.color = color
  })

  return { columns, topBar, borderColor, numberStartIndex, type, theme }
}
