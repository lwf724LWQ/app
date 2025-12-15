import { DrawShape } from './drawMethod'
import { getDate } from './utils'
import { useDrawLineSettingStore } from '@/stores/drawLine'

const systemInfo = uni.getSystemInfoSync()
let ratio = systemInfo.screenWidth / 750
const windowHeight = systemInfo.windowHeight
const safeAreaTop = systemInfo.safeAreaInsets.top

const PADDING = 0.01

let borderColor, columns, type, theme, numberStartIndex, rowHeight

const getStyleConfig = () => {
  const drawLineSettingStore = useDrawLineSettingStore()
  columns = drawLineSettingStore.styleConfig.columns
  borderColor = drawLineSettingStore.styleConfig.borderColor
  type = drawLineSettingStore.styleConfig.type
  theme = drawLineSettingStore.styleConfig.theme
  numberStartIndex = drawLineSettingStore.styleConfig.numberStartIndex
  rowHeight = drawLineSettingStore.options.rowHeight * ratio
}

// 获取行和列
export const getRowAndColumn = (x, y) => {
  const column = columns.findIndex((column) => column.left <= x && column.right >= x)
  const row = Math.floor(y / rowHeight)
  return { row, column }
}
export const getPointPosition = (x, y) => {
  const { row, column } = getRowAndColumn(x, y)
  const startX = columns[column]?.left + columns[column]?.width / 2
  const startY = row * rowHeight + rowHeight / 2
  return { x: Math.trunc(startX), y: Math.trunc(startY), row, column }
}

export class Draw {
  constructor(
    bgCtx,
    baseCtx,
    paintCtx,
    contentCtx,
    activeCtx,
    imageCtx,
    data,
    options,
    canvasSize
  ) {
    this.bgCtx = bgCtx
    this.baseCtx = baseCtx
    this.paintCtx = paintCtx
    this.contentCtx = contentCtx
    this.activeCtx = activeCtx
    this.imageCtx = imageCtx
    this.data = data
    this.options = options
    this.canvasSize = canvasSize

    this.drawShapeBg = new DrawShape(bgCtx)
    this.drawShapeBase = new DrawShape(baseCtx)
    this.drawShapePain = new DrawShape(paintCtx)
    this.drawShapeContent = new DrawShape(contentCtx)
    this.drawShapeActive = new DrawShape(activeCtx)
    this.drawShapeImage = new DrawShape(imageCtx)

    getStyleConfig()

    this.drawGrid() // 绘制网格

    this.data.value.forEach((item, index) => {
      this.drawContent(index, item)
    })
    this.contentCtx.draw()
  }
  draw(record, pointActives) {
    this.record = record
    this.drawLine(record)

    this.drawActiveNumber(pointActives)

    this.drawMark(record)
    this.baseCtx.draw()
    this.activeCtx.draw()
  }
  drawAllText(pointActives) {
    this.data.value.forEach((item, index) => {
      this.drawContent(index, item)
    })
    this.drawActiveNumber(pointActives)
    this.contentCtx.draw()
    this.activeCtx.draw()
  }
  // 重新绘制所有画布
  async redraw(record, pointActives) {
    this.record = record
    getStyleConfig()

    // setTimeout(() => {
    this.drawGrid()

    this.data.value.forEach((item, index) => {
      this.drawContent(index, item)
    })
    this.contentCtx.draw()

    this.draw(record, pointActives)
    // }, 0)
  }
  // 绘制网格
  drawGrid() {
    this.drawGridBackground()
    this.drawGridRow()
    this.drawGridColumn()
    this.bgCtx.draw()
  }
  // 绘制网格行
  drawGridRow() {
    for (let index = 0; index < this.data.value.length + this.options.bottomRow; index++) {
      let width
      if (theme !== '其他') {
        if (index % 4 == 0) width = 4 * ratio
        else width = 2 * ratio
      } else {
        if (index % 4 == 0) width = 1 * ratio
        else continue
      }
      this.drawShapeBg.drawnStraightLine(
        0,
        index * rowHeight,
        columns[columns.length - 1].right,
        index * rowHeight,
        borderColor,
        width
      )
    }
  }
  // 绘制网格列
  drawGridColumn() {
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index]
      if (column.border === 0) continue
      const x = columns[index].right + columns[index].border / 2
      const y = 0
      const endY = (this.data.value.length + this.options.bottomRow) * rowHeight
      this.drawShapeBg.drawnStraightLine(x, y, x, endY, borderColor, column.border)
    }
  }
  // 绘制网格背景
  drawGridBackground() {
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index]
      const x = columns[index]?.left || 0
      const y = 0
      const width = column.width
      const height = (this.data.value.length + this.options.bottomRow) * rowHeight
      let color = column.backgroundColor
      this.drawShapeBg.drawSolidRect(x, y, width, height, color)
    }
  }
  // 绘制内容
  drawContent(rowIndex, data) {
    const numbers = data.number

    const dayeColumn = () => {
      let value, x, y, color, fontSize

      fontSize = columns[0].fontSize

      value = data.issueno
      x = columns[0].width / 2
      y = (rowIndex + 1) * rowHeight - 70 * ratio
      color = columns[0].color
      this.drawShapeContent.drawText(
        value,
        x,
        y,
        color,
        fontSize[0] * this.options.fontSizeRatio,
        this.options.fontFamily,
        'bold'
      )

      value = getDate(data.opendate)
      x = columns[0].width / 2
      y = (rowIndex + 1) * rowHeight - 30 * ratio
      color = columns[0].color
      this.drawShapeContent.drawText(
        value,
        x,
        y,
        color,
        fontSize[1] * this.options.fontSizeRatio,
        this.options.fontFamily,
        'bold'
      )
    }

    if (theme === '其他') {
      switch (type) {
        case '排列五':
          let text = numbers.slice(0, 4).reduce((sum, item) => Number(sum) + Number(item), 0) % 10
          this.drawCenterText(this.drawShapeContent, rowIndex, 0, text, columns[0].fontSize)
          for (let index = 1; index < numbers.length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index,
              numbers[index - 1],
              columns[index].fontSize
            )
          }
          this.drawCenterText(this.drawShapeContent, rowIndex, 5, numbers[4], columns[5].fontSize)
          break
        case '福彩3D':
          this.drawCenterText(
            this.drawShapeContent,
            rowIndex,
            0,
            numbers.slice(0, 4).reduce((sum, item) => Number(sum) + Number(item), 0) % 10,
            50 * ratio
          )
          for (let index = 0; index < numbers.length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index + 1,
              numbers[index],
              60 * ratio
            )
          }
          break
        case '七星彩':
          this.drawCenterText(
            this.drawShapeContent,
            rowIndex,
            0,
            numbers.slice(0, 4).reduce((sum, item) => Number(sum) + Number(item), 0) % 10,
            columns[0].fontSize
          )
          for (let index = 0; index < numbers.length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index + 1,
              numbers[index],
              columns[index + 1].fontSize
            )
          }
          break
      }
    } else {
      dayeColumn()

      this.drawCenterText(
        this.drawShapeContent,
        rowIndex,
        1,
        numbers.slice(0, 4).reduce((sum, item) => Number(sum) + Number(item), 0),
        columns[1].fontSize
      )
      switch (type) {
        case '排列五':
          for (let index = 0; index < numbers.length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index + 2,
              numbers[index],
              columns[index + 2].fontSize
            )
          }
          break
        case '福彩3D':
          for (let index = 0; index < numbers.length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index + 2,
              numbers[index],
              columns[index + 2].fontSize
            )
          }
          break
        case '七星彩':
          for (let index = 0; index < numbers.slice(0, 4).length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index + 2,
              numbers[index],
              columns[index + 2].fontSize
            )
          }
          for (let index = 0; index < numbers.slice(4, 7).length; index++) {
            this.drawCenterText(
              this.drawShapeContent,
              rowIndex,
              index + 6,
              numbers[index + 4],
              columns[index + 6].fontSize
            )
          }
          break
      }
    }
  }
  //绘制居中文字
  drawCenterText(drawShape, rowIndex, columnIndex, text, fontSize, color) {
    const x = columns[columnIndex].left + columns[columnIndex].width / 2
    const y = (rowIndex + 0.5) * rowHeight

    drawShape.drawText(
      text,
      x,
      y,
      color || columns[columnIndex].color,
      fontSize * this.options.fontSizeRatio,
      this.options.fontFamily,
      'bold'
    )
  }
  drawLine(record) {
    if (!record || record.length <= 0) return
    const draw = (item) => {
      if (!item?.line) return
      const type = item.line.type
      const color = item.style.color
      const size = item.style.size

      if (type === 'straight') {
        const { startX, startY, endX, endY } = item.line.position
        this.drawShapeBase.drawnStraightLine(startX, startY, endX, endY, color, size)
      }
      if (type === 'curve') {
        const { startX, startY, centerX, centerY, endX, endY } = item.line.position
        this.drawShapeBase.drawnCurveLine(startX, startY, centerX, centerY, endX, endY, color, size)
      }
      if (type === 'track') {
        const track = item.line.position
        this.drawShapeBase.drawnTrack(track, color, size)
      }
      if (type === 'solidRect') {
        const { x, y, width, height } = item.line.position
        this.drawShapeBase.drawSolidRect(x, y, width, height, color)
      }
      if (type === 'hollowRect') {
        const { x, y, width, height } = item.line.position
        this.drawShapeBase.drawHollowRect(x, y, width, height, color, size)
      }
      if (type === 'solidCircle') {
        const { startX, startY, endX, endY } = item.line.position
        this.drawShapeBase.drawSolidCircle(startX, startY, endX, endY, color, size)
      }
      if (type === 'hollowCircle') {
        const { startX, startY, endX, endY } = item.line.position
        this.drawShapeBase.drawHollowCircle(startX, startY, endX, endY, color, size)
      }
    }
    record.forEach((item) => {
      if (Array.isArray(item)) {
        item.forEach((recordItem) => {
          draw(recordItem)
        })
      } else {
        draw(item)
      }
    })
  }
  // 渲染激活数字
  drawActiveNumber(pointActives) {
    if (!pointActives || pointActives.length <= 0) return

    for (const pointKey in pointActives) {
      const { color, isSolid, isRound } = pointActives[pointKey]
      let [rowIndex, columnIndex] = pointKey.split('-')
      rowIndex = Number(rowIndex)
      columnIndex = Number(columnIndex)
      const text = this.getNumber(rowIndex, columnIndex)
      this.drawPoint(rowIndex, columnIndex, color, isSolid, isRound, text)
    }
  }
  drawPoint(rowIndex, columnIndex, color, isSolid, isRound, text) {
    const columnStyle = columns[columnIndex]
    // 绘制背景
    if (isSolid) {
      const colors = ['rgba(0, 0, 0, 0.07)', '#fffaf6', color]
      for (let index = 0; index < 3; index++) {
        const minSize = Math.min(columnStyle.width, rowHeight)
        const cloumnWidth = columnStyle.width
        const padding = cloumnWidth * PADDING + index * 4 * ratio
        const x = columnStyle.left + (columnStyle.width - minSize) / 2 + padding
        const size = minSize - padding * 2
        const y = rowIndex * rowHeight + (rowHeight - minSize) / 2 + padding

        if (isRound) this.drawShapeActive.drawSolidCircle(x, y, x + size, y + size, colors[index])
        else this.drawShapeActive.drawSolidRect(x, y, size, size, colors[index])
      }
    } else {
      const minSize = Math.min(columnStyle.width, rowHeight)
      const cloumnWidth = columnStyle.width
      const padding = cloumnWidth * PADDING + 8 * ratio
      const x = columnStyle.left + (columnStyle.width - minSize) / 2 + padding
      const size = minSize - padding * 2
      const y = rowIndex * rowHeight + (rowHeight - minSize) / 2 + padding

      if (isRound) {
        if (theme !== '其他') this.drawShapeActive.drawSolidCircle(x, y, x + size, y + size, '#fff')
        this.drawShapeActive.drawHollowCircle(x, y, x + size, y + size, color, 5 * ratio)
      } else {
        if (theme !== '其他') this.drawShapeActive.drawSolidRect(x, y, size, size, '#fff')
        this.drawShapeActive.drawHollowRect(x, y, size, size, color, 5 * ratio)
      }
    }

    // 绘制文字
    if (text === undefined) return
    let fontSize = columnStyle.fontSize
    if (text.length >= 3) fontSize = fontSize * 0.8
    this.drawCenterText(
      this.drawShapeActive,
      rowIndex,
      columnIndex,
      text,
      fontSize,
      isSolid ? '#fff' : color
    )
  }
  getNumber(rowIndex, columnIndex) {
    if (theme === '其他') {
      if (columnIndex === 0) {
        return (
          this.data.value[rowIndex] &&
          this.data.value[rowIndex].number
            .slice(0, 4)
            .reduce((prev, cur) => Number(prev) + Number(cur), 0) % 10
        )
      }

      let index = columnIndex - numberStartIndex - 1
      return this.data.value[rowIndex]?.number[index]
    } else {
      if (columnIndex === 1) {
        return (
          this.data.value[rowIndex] &&
          this.data.value[rowIndex].number
            .slice(0, 4)
            .reduce((prev, cur) => Number(prev) + Number(cur), 0)
        )
      }

      let index = columnIndex - numberStartIndex - 1

      return this.data.value[rowIndex]?.number[index]
    }
  }
  drawMark(record) {
    if (!record?.length) return
    record.forEach((item) => {
      const mark = Array.isArray(item) ? item[0]?.mark : item?.mark
      let color = Array.isArray(item) ? item[0]?.style.color : item?.style.color

      if (!mark) return
      const isSenior = mark.senior
      const isSolid = mark.isSolid

      mark.indexs.forEach((index) => {
        const minSize = Math.min(columns[index].width, rowHeight)
        const centerX = columns[index].left + columns[index].width / 2
        const padding = minSize * PADDING * 2
        const x = columns[index].left + (columns[index].width - minSize) / 2 + padding
        const y = mark.row * rowHeight + (rowHeight - minSize) / 2 + padding
        const size = minSize - padding * 2
        // {"condition":"大","numbers":[5,6,7,8,9],"isSolid":true,"indexs":[2],"senior":true,"row":40}
        if (isSenior) {
          let fontColor
          if (isSolid) {
            fontColor = '#fff'
            this.drawShapeActive.drawSolidRect(x, y, size, size, color)
          } else {
            fontColor = color
            this.drawShapeActive.drawSolidRect(x, y, size, size, columns[index].backgroundColor)
            this.drawShapeActive.drawHollowRect(x, y, size, size, color, 3 * ratio)
          }
          // 更改字号
          let fontSize = 30 * ratio
          if (!mark.condition) {
            if (mark.numbers.length === 1) {
              fontSize = 60 * ratio
            } else if (mark.numbers.length <= 2) {
              fontSize = 50 * ratio
            } else {
              fontSize = 40 * ratio
            }
          }
          // 文字位置
          let fontY1 = y + 22 * ratio
          let fontY2 = y + 52 * ratio
          let fontY3 = y + 82 * ratio

          if (!mark.condition && mark.numbers.length > 3) {
            fontY2 = y + 35 * ratio
            fontY3 = y + 75 * ratio
            fontSize = 40 * ratio
          } else if (mark.condition && mark.numbers.length < 3) {
            fontY1 = y + 35 * ratio
            fontY2 = y + 75 * ratio
            fontSize = 40 * ratio
          }

          // 第一行文字
          mark.condition &&
            this.drawShapeActive.drawText(
              mark.condition,
              centerX,
              fontY1,
              fontColor,
              fontSize,
              this.options.fontFamily,
              'bold'
            )
          // 第二行数字
          if (mark.numbers.length > 0) {
            this.drawShapeActive.drawText(
              mark.numbers.slice(0, 3).join(''),
              centerX,
              fontY2,
              fontColor,
              fontSize,
              this.options.fontFamily,
              'bold'
            )
          }
          // 第三行数字
          if (mark.numbers.length > 3) {
            this.drawShapeActive.drawText(
              mark.numbers.slice(3, 5).join(''),
              centerX,
              fontY3,
              fontColor,
              fontSize,
              this.options.fontFamily,
              'bold'
            )
          }
        } else {
          this.drawPoint(mark.row, index, color, isSolid, true, mark.condition)
        }
      })
    })
  }
  async saveDraw() {
    await this.drawToCanvas(this.paintCtx, this.baseCtx)
    this.reset(this.paintCtx)
  }
  // 将canvas绘制到另一个canvas上,耗时较长
  drawToCanvas(sourseCtx, targetCtx, y) {
    const sourseCtxId = sourseCtx.id || sourseCtx.canvasId
    const targetCtxId = targetCtx.id || targetCtx.canvasId

    const width = Math.trunc(this.canvasSize.width) - 1
    let height
    if (y) {
      height = Math.trunc(windowHeight - 130 * ratio - safeAreaTop)
    } else {
      height = Math.trunc(this.canvasSize.height)
      y = 0
    }

    return new Promise((resolve, reject) => {
      uni.canvasGetImageData({
        canvasId: sourseCtxId,
        x: 0,
        y,
        width,
        height,
        success(res) {
          uni.canvasPutImageData({
            canvasId: targetCtxId,
            x: 0,
            y,
            width,
            height,
            data: res.data,
            success(res) {
              resolve(res)
            },
            fail(err) {
              reject(err)
            }
          })
        }
      })
    })
  }
  //画布重置
  reset(ctx) {
    ctx.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height)
    ctx.draw()
  }
  // 保存所有绘制内容
  async save(top) {
    const imageCtx = this.imageCtx
    const sourseCtxes = [this.bgCtx, this.baseCtx, this.contentCtx, this.activeCtx]
    const promiseMap = sourseCtxes.map((ctx) => this.drawToCanvas(ctx, imageCtx, top))
    await Promise.all(promiseMap)
    this.drawHoverText(top)
    return new Promise((resolve, reject) => {
      uni.canvasToTempFilePath({
        canvasId: imageCtx.id,
        y: top,
        height: windowHeight - 130 * ratio,
        success(res) {
          resolve(res.tempFilePath)
          imageCtx.draw(false)
        },
        fail(err) {
          reject(err)
        }
      })
    })
  }
  // 绘制悬浮文字
  drawHoverText(top) {
    const bottom = top + Math.trunc(windowHeight - 130 * ratio - safeAreaTop)
    const round = 5 * ratio
    this.record.forEach((item) => {
      const style = item.style
      const text = item.text
      const { width, height } = text
      const { x, y } = text.position
      // 判断是否在可视区域内
      if (y >= top && y + text.height <= bottom) {
        if (item.isSolid)
          this.drawShapeImage.drawSolidRoundRect(x, y, width, height, round, style.color)

        this.drawShapeImage.drawText(
          text.content,
          x + width / 2,
          y + height / 2 + style.fontSize * 0.1,
          item.isSolid ? '#fff' : style.color,
          this.options.fontFamily,
          style.fontSize
        )
      }
    })
    this.imageCtx.draw(true)
  }
}
