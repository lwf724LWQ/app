export class DrawShape {
  constructor(color, size, ctx) {
    this.color = color
    this.size = size
    this.ctx = ctx
  }
  // 绘制直线
  drawnStraightLine = (
    startX,
    startY,
    endX,
    endY,
    color = this.color.value,
    size = this.size.value
  ) => {
    this.ctx.beginPath()
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.moveTo(startX, startY)
    this.ctx.lineTo(endX, endY)
    this.ctx.stroke()
  }
  // 绘制曲线
  drawnCurveLine = (
    startX,
    startY,
    centerX,
    centerY,
    endX,
    endY,
    color = this.color.value,
    size = this.value
  ) => {
    this.ctx.beginPath()
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.moveTo(startX, startY)
    this.ctx.quadraticCurveTo(centerX, centerY, endX, endY)
    this.ctx.stroke()
  }
  // 绘制轨迹
  drawnTrack = (TrackList, color = this.color.value, size = this.size.value) => {
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.beginPath()
    this.ctx.moveTo(TrackList[0].x, TrackList[0].y)
    TrackList.forEach((item) => {
      this.ctx.lineTo(item.x, item.y)
    })
    this.ctx.stroke()
  }
  // 绘制实心方框
  drawSolidRect = (x, y, width, height, color = this.color.value) => {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
  }
  // 绘制空心方框
  drawHollowRect = (x, y, width, height, color = this.color.value, size = this.size.value) => {
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.strokeRect(x, y, width, height)
  }
  // 绘制实心圆/椭圆
  drawSolidCircle = (startX, startY, endX, endY, color = this.color.value) => {
    const x = (startX + endX) / 2
    const y = (startY + endY) / 2
    const rX = Math.abs(startX - endX) / 2
    const rY = Math.abs(startY - endY) / 2

    this.ctx.fillStyle = color
    this.ctx.setStrokeStyle(color)
    this.ctx.beginPath()

    // 贝塞尔曲线模拟椭圆
    this.ctx.moveTo(x + rX, y)
    this.ctx.bezierCurveTo(x + rX, y - rY * 0.5523, x + rX * 0.5523, y - rY, x, y - rY)
    this.ctx.bezierCurveTo(x - rX * 0.5523, y - rY, x - rX, y - rY * 0.5523, x - rX, y)
    this.ctx.bezierCurveTo(x - rX, y + rY * 0.5523, x - rX * 0.5523, y + rY, x, y + rY)
    this.ctx.bezierCurveTo(x + rX * 0.5523, y + rY, x + rX, y + rY * 0.5523, x + rX, y)
    this.ctx.fill()
  }
  // 绘制空心圆/椭圆
  drawHollowCircle = (
    startX,
    startY,
    endX,
    endY,
    color = this.color.value,
    size = this.size.value
  ) => {
    const x = (startX + endX) / 2
    const y = (startY + endY) / 2
    const rX = Math.abs(startX - endX) / 2
    const rY = Math.abs(startY - endY) / 2

    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.beginPath()

    // 贝塞尔曲线模拟椭圆
    this.ctx.moveTo(x + rX, y)
    this.ctx.bezierCurveTo(x + rX, y - rY * 0.5523, x + rX * 0.5523, y - rY, x, y - rY)
    this.ctx.bezierCurveTo(x - rX * 0.5523, y - rY, x - rX, y - rY * 0.5523, x - rX, y)
    this.ctx.bezierCurveTo(x - rX, y + rY * 0.5523, x - rX * 0.5523, y + rY, x, y + rY)
    this.ctx.bezierCurveTo(x + rX * 0.5523, y + rY, x + rX, y + rY * 0.5523, x + rX, y)
    this.ctx.stroke()
  }
}
