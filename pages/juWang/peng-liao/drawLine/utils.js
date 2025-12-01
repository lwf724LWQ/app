// 计算曲线坐标
export const getCurvePoint = (x1, y1, x2, y2, distance) => {
  // 计算中点
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  // 计算向量 AB
  const dx = x2 - x1
  const dy = y2 - y1
  // 计算垂直向量
  const perpendicularDx = -dy
  const perpendicularDy = dx

  const length = Math.sqrt(perpendicularDx * perpendicularDx + perpendicularDy * perpendicularDy)
  const unitX = perpendicularDx / length
  const unitY = perpendicularDy / length
  // 计算两侧点坐标
  const point1 = {
    x: midX + unitX * distance,
    y: midY + unitY * distance
  }
  const point2 = {
    x: midX - unitX * distance,
    y: midY - unitY * distance
  }
  const offset1 = point1.x * 2 - midX
  const offset2 = point2.x * 2 - midX

  if (point1.y >= midY) {
    return [point2, point1, offset2, offset1]
  } else {
    return [point1, point2, offset1, offset2]
  }
}
