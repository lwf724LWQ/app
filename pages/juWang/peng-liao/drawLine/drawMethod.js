export class DrawShape {
  constructor(ctx) {
    this.ctx = ctx
  }
  draw(...args) {
    this.ctx.draw(...args)
  }
  // 绘制直线
  drawnStraightLine(startX, startY, endX, endY, color, size) {
    this.ctx.beginPath()
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.moveTo(startX, startY)
    this.ctx.lineTo(endX, endY)
    this.ctx.stroke()
  }
  // 绘制曲线
  drawnCurveLine(startX, startY, centerX, centerY, endX, endY, color, size = this.value) {
    this.ctx.beginPath()
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.moveTo(startX, startY)
    this.ctx.quadraticCurveTo(centerX, centerY, endX, endY)
    this.ctx.stroke()
  }
  // 绘制轨迹
  drawnTrack(TrackList, color, size) {
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
  drawSolidRect(x, y, width, height, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
  }
  // 绘制空心方框
  drawHollowRect(x, y, width, height, color, size) {
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.ctx.strokeRect(x, y, width, height)
  }
  // 绘制圆角实心方框
  drawRoundRect(x, y, width, height, radius, color) {
    radius = radius * 2
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
  }
  // 绘制圆角实心方框
  drawSolidRoundRect(x, y, width, height, radius, color) {
    this.ctx.setFillStyle(color)
    this.drawRoundRect(x, y, width, height, radius, color)
    this.ctx.fill()
  }
  // 绘制圆角空心方框
  drawHollowRoundRect(x, y, width, height, radius, color, size) {
    this.ctx.lineWidth = size
    this.ctx.setStrokeStyle(color)
    this.drawRoundRect(x, y, width, height, radius, color)
    this.ctx.stroke()
  }
  // 绘制实心圆/椭圆
  drawSolidCircle(startX, startY, endX, endY, color) {
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
  drawHollowCircle(startX, startY, endX, endY, color, size) {
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
  // 绘制文字
  drawText(text, x, y, color, size, fontWeight = 'normal') {
    this.ctx.textAlign = 'center'
    this.ctx.font = `${fontWeight} ${Math.round(size)}px Arial`
    this.ctx.textBaseline = 'middle'
    this.ctx.setFillStyle(color)
    this.ctx.fillText(text, x, y)
  }
}
