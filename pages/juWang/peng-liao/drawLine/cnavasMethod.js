import { DrawShape } from './drawMethod'
import { getDate } from './utils'
import { useDrawLineSettingStore } from '@/stores/drawLine'

const systemInfo = uni.getSystemInfoSync()
let ratio = systemInfo.screenWidth / 750

const ROW_HEIGHT = 110 * ratio

let borderColor, columns, type, theme, numberStartIndex

const getStyleConfig = () => {
  const drawLineSettingStore = useDrawLineSettingStore()
  columns = drawLineSettingStore.styleConfig.columns
  borderColor = drawLineSettingStore.styleConfig.borderColor
  type = drawLineSettingStore.styleConfig.type
  theme = drawLineSettingStore.styleConfig.theme
  numberStartIndex = drawLineSettingStore.styleConfig.numberStartIndex
}

// 获取行和列
export const getRowAndColumn = (x, y) => {
  const column = columns.findIndex((column) => column.left <= x && column.right >= x)
  const row = Math.floor(y / ROW_HEIGHT)
  return { row, column }
}
export const getPointPosition = (x, y) => {
  const { row, column } = getRowAndColumn(x, y)
  const startX = columns[column]?.left + columns[column]?.width / 2
  const startY = row * ROW_HEIGHT + ROW_HEIGHT / 2
  return { x: Math.trunc(startX), y: Math.trunc(startY), row, column }
}

export class Draw {
  constructor(bgCtx, baseCtx, paintCtx, contentCtx, activeCtx, data, options, canvasSize) {
    this.bgCtx = bgCtx
    this.baseCtx = baseCtx
    this.paintCtx = paintCtx
    this.contentCtx = contentCtx
    this.activeCtx = activeCtx
    this.data = data
    this.options = options
    this.canvasSize = canvasSize

    this.drawShapeBg = new DrawShape(bgCtx)
    this.drawShapeBase = new DrawShape(baseCtx)
    this.drawShapePain = new DrawShape(paintCtx)
    this.drawShapeContent = new DrawShape(contentCtx)
    this.drawShapeActive = new DrawShape(activeCtx)

    getStyleConfig()

    this.drawGrid() // 绘制网格

    this.data.value.forEach((item, index) => {
      this.drawContent(index, item)
    })
    this.contentCtx.draw()
  }
  draw(record, pointActives) {
    this.drawLine(record)

    this.drawPoint(pointActives)

    this.drawMark(record)
    this.baseCtx.draw()
    this.activeCtx.draw()
  }
  // 重新绘制所有画布
  redraw(record, pointActives) {
    getStyleConfig()

    this.drawGrid()

    this.data.value.forEach((item, index) => {
      this.drawContent(index, item)
    })
    this.contentCtx.draw()

    this.draw(record, pointActives)
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
        index * ROW_HEIGHT,
        columns[columns.length - 1].right,
        index * ROW_HEIGHT,
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
      const endY = (this.data.value.length + this.options.bottomRow) * ROW_HEIGHT
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
      const height = (this.data.value.length + this.options.bottomRow) * ROW_HEIGHT
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
      y = (rowIndex + 1) * ROW_HEIGHT - 70 * ratio
      color = columns[0].color
      this.drawShapeContent.drawText(value, x, y, color, fontSize[0])

      value = getDate(data.opendate)
      x = columns[0].width / 2
      y = (rowIndex + 1) * ROW_HEIGHT - 30 * ratio
      color = columns[0].color
      this.drawShapeContent.drawText(value, x, y, color, fontSize[1])
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
        numbers.slice(0, 4).reduce((sum, item) => Number(sum) + Number(item), 0) % 10,
        50 * ratio
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
    const y = (rowIndex + 0.5) * ROW_HEIGHT + fontSize * 0.1

    drawShape.drawText(text, x, y, color || columns[columnIndex].color, fontSize)
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
  drawPoint(pointActives) {
    if (!pointActives || pointActives.length <= 0) return

    const padding = 3 * ratio

    for (const pointKey in pointActives) {
      const { color, isSolid, isRound } = pointActives[pointKey]
      let [rowIndex, columnIndex] = pointKey.split('-')
      rowIndex = Number(rowIndex)
      columnIndex = Number(columnIndex)
      const columnStyle = columns[columnIndex]
      // 绘制背景
      if (isSolid) {
        const colors = ['#f0f0ec', '#fffaf6', color]
        for (let index = 0; index < 3; index++) {
          const maxSize = Math.min(columnStyle.width, ROW_HEIGHT)
          const tmpPadding = 3 * ratio * index + padding
          const x = columnStyle.left + (columnStyle.width - maxSize) / 2 + tmpPadding
          const size = maxSize - tmpPadding * 2
          const y = rowIndex * ROW_HEIGHT + (ROW_HEIGHT - maxSize) / 2 + tmpPadding

          if (isRound) this.drawShapeActive.drawSolidCircle(x, y, x + size, y + size, colors[index])
          else this.drawShapeActive.drawSolidRect(x, y, size, size, colors[index])
        }
      } else {
        const maxSize = Math.min(columnStyle.width, ROW_HEIGHT)
        const tmpPadding = 6 * ratio + padding
        const x = columnStyle.left + (columnStyle.width - maxSize) / 2 + tmpPadding
        const size = maxSize - tmpPadding * 2
        const y = rowIndex * ROW_HEIGHT + (ROW_HEIGHT - maxSize) / 2 + tmpPadding

        if (isRound) {
          this.drawShapeActive.drawSolidCircle(x, y, x + size, y + size, '#fff')
          this.drawShapeActive.drawHollowCircle(x, y, x + size, y + size, color, 3 * ratio)
        } else {
          this.drawShapeActive.drawSolidRect(x, y, size, size, '#fff')
          this.drawShapeActive.drawHollowRect(x, y, size, size, color, 3 * ratio)
        }
      }
      // 绘制文字
      const text = this.getNumber(rowIndex, columnIndex)

      if (text === undefined) continue
      this.drawCenterText(
        this.drawShapeActive,
        rowIndex,
        columnIndex,
        text,
        columnStyle.fontSize,
        isSolid ? '#fff' : color
      )
    }
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
            .reduce((prev, cur) => Number(prev) + Number(cur), 0) % 10
        )
      }

      let index = columnIndex - numberStartIndex - 1
      // console.log(index, columnIndex, numberStartIndex)

      return this.data.value[rowIndex]?.number[index]
    }
  }
  drawMark(record) {
    record.forEach((item) => {
      const mark = Array.isArray(item) ? item[0]?.mark : item?.mark
      const color = Array.isArray(item) ? item[0]?.style.color : item?.style.color
      if (!mark) return

      mark.indexs.forEach((index) => {
        const x = columns[index].left
        const y = mark.row * ROW_HEIGHT
        const width = columns[index].width
        const height = ROW_HEIGHT
        // {"condition":"大","numbers":[5,6,7,8,9],"isSolid":true,"indexs":[2],"senior":true,"row":40}
        this.drawShapeActive.drawSolidRect(x, y, width, height, color)
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
        // 第一行文字
        mark.condition &&
          this.drawShapeActive.drawText(
            mark.condition,
            x + width / 2,
            y + 30 * ratio,
            '#fff',
            fontSize
          )
        // 第二行数字
        if (mark.numbers.length > 0) {
          this.drawShapeActive.drawText(
            mark.numbers.slice(0, 3).join(''),
            x + width / 2,
            y + 60 * ratio,
            '#fff',
            fontSize
          )
        }
        // 第三行数字
        if (mark.numbers.length > 3) {
          this.drawShapeActive.drawText(
            mark.numbers.slice(3, 5).join(''),
            x + width / 2,
            y + 90 * ratio,
            '#fff',
            fontSize
          )
        }
      })
    })
  }
  async saveDraw() {
    await this.drawToCanvas(this.paintCtx, this.baseCtx)
    this.reset(this.paintCtx)
  }
  // 将canvas绘制到另一个canvas上,耗时较长
  drawToCanvas(sourseCtx, targetCtx) {
    const sourseCtxId = sourseCtx.id
    const targetCtxId = targetCtx.id

    const width = this.canvasSize.width
    const height = this.canvasSize.height

    return new Promise((resolve) => {
      uni.canvasGetImageData({
        canvasId: sourseCtxId,
        x: 0,
        y: 0,
        width,
        height,
        success(res) {
          uni.canvasPutImageData({
            canvasId: targetCtxId,
            x: 0,
            y: 0,
            width,
            height,
            data: res.data,
            success(res) {
              resolve(res)
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
}
