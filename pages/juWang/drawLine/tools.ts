import { Position } from "./table";
/**
 * 计算点到线段的最短距离
 * @param {Object} b - 目标点坐标 {x, y}
 * @param {Object} a1 - 线段起点坐标 {x, y}
 * @param {Object} a2 - 线段终点坐标 {x, y}
 * @returns {number} 点b到线段a1a2的最短距离
 */
function pointToSegmentDistance(b: Position, a1: Position, a2: Position) {
    const realb = b.getRealPosition()
    const reala1 = a1.getRealPosition()
    const reala2 = a2.getRealPosition()
    if (!realb || !reala1 || !reala2) {
        throw new Error('Invalid position data');
    }
    // 向量计算
    const dx = reala2.x - reala1.x;
    const dy = reala2.y - reala1.y;
    
    // 线段长度的平方
    const segmentLengthSquared = dx * dx + dy * dy;
    
    // 如果线段长度为0，则为点到点的距离
    if (segmentLengthSquared === 0) {
        return Math.sqrt((realb.x - reala1.x) ** 2 + (realb.y - reala1.y) ** 2);
    }
    
    // 投影参数t，表示点b在线段延长线上的投影位置
    const t = ((realb.x - reala1.x) * dx + (realb.y - reala1.y) * dy) / segmentLengthSquared;
    
    let closestX, closestY;
    
    // 根据投影位置确定线段上最近的点
    if (t < 0) {
        // 投影在线段起点之外，最近点为起点reala1
        closestX = reala1.x;
        closestY = reala1.y;
    } else if (t > 1) {
        // 投影在线段终点之外，最近点为终点reala2
        closestX = reala2.x;
        closestY = reala2.y;
    } else {
        // 投影在线段内部，最近点为投影点
        closestX = reala1.x + t * dx;
        closestY = reala1.y + t * dy;
    }
    
    // 返回点到最近点的距离
    return Math.sqrt((realb.x - closestX) ** 2 + (realb.y - closestY) ** 2);
}

/**
 * 计算两点之间的欧几里得距离
 * @param a - 起始点坐标 {x, y}
 * @param b - 终止点坐标 {x, y}
 * @returns 点a与点b之间的直线距离
 */
function distanceBetweenPoints(a: Position, b: Position): number {
    const realA = a.getRealPosition();
    const realB = b.getRealPosition();
    
    if (!realA || !realB) {
        throw new Error('Invalid position data');
    }
    
    const dx = realB.x - realA.x;
    const dy = realB.y - realA.y;
    
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 判断点是否在由两个点定义的矩形区域内（包括边界）
 * @param a - 待检测的点
 * @param B1 - 矩形的一个顶点
 * @param B2 - 矩形的对角顶点
 * @returns 点a是否在矩形B1,B2中
 */
function isPointInRectangle(a: Position, B1: Position, B2: Position): boolean {
    const realA = a.getRealPosition();
    const realB1 = B1.getRealPosition();
    const realB2 = B2.getRealPosition();
    
    if (!realA || !realB1 || !realB2) {
        throw new Error('Invalid position data');
    }
    
    // 找到矩形的边界坐标
    const minX = Math.min(realB1.x, realB2.x);
    const maxX = Math.max(realB1.x, realB2.x);
    const minY = Math.min(realB1.y, realB2.y);
    const maxY = Math.max(realB1.y, realB2.y);
    
    // 判断点是否在矩形范围内
    return realA.x >= minX && realA.x <= maxX && realA.y >= minY && realA.y <= maxY;
}

/**
 * 计算点到二次贝塞尔曲线的路径点
 * @param a1 - 贝塞尔曲线起点 {x, y}
 * @param a2 - 贝塞尔曲线终点 {x, y}
 * @param c1 - 贝塞尔曲线控制点 {x, y}
 * @returns 一个包含贝塞尔曲线点的数组
 */
function getBezierPath(a1: Position, a2: Position, c1: Position):({x:number,y:number})[] {
    const reala1 = a1.getRealPosition();
    const reala2 = a2.getRealPosition();
    const realc1 = c1.getRealPosition();
    
    if (!reala1 || !reala2 || !realc1) {
        throw new Error('Invalid position data');
    }
    
    // 二次贝塞尔曲线公式: B(t) = (1-t)²*P0 + 2*(1-t)*t*P1 + t²*P2
    // 其中 P0=a1, P1=c1, P2=a2
    
    // 路径
    const path:({x:number,y:number})[] = []
    const steps = 100; // 采样点数，可根据精度要求调整
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        
        // 计算曲线上对应t的点
        const x = Math.pow(1 - t, 2) * reala1.x + 2 * (1 - t) * t * realc1.x + Math.pow(t, 2) * reala2.x;
        const y = Math.pow(1 - t, 2) * reala1.y + 2 * (1 - t) * t * realc1.y + Math.pow(t, 2) * reala2.y;
        
        path.push({x, y});
    }
    
    return path;
}


/**
 * 计算矩形的宽度和高度
 * @param {Object} a1 - 左下顶点坐标 {x, y}
 * @param {Object} a2 - 右上顶点坐标 {x, y}
 * @returns {Object} 包含宽度和高度的对象
 */
function getRectangleDimensions(a1:{x: number, y: number}, a2:{x: number, y: number}) {
  const width = Math.abs(a2.x - a1.x);
  const height = Math.abs(a2.y - a1.y);
  return {
      width: width,
      height: height
  };
}


/**
 * 深度比较两个对象是否相等
 * @param obj1 第一个对象
 * @param obj2 第二个对象
 * @returns 如果两个对象深度相等返回true，否则返回false
 */
function deepEqual(obj1: any, obj2: any): boolean {
    // 严格相等检查（包括基本类型和引用地址）
    if (obj1 === obj2) {
      return true;
    }
  
    // null 和 undefined 的特殊情况处理
    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }
  
    // 类型不一致直接返回false
    if (typeof obj1 !== typeof obj2) {
      return false;
    }
  
    // 处理Date类型
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.getTime() === obj2.getTime();
    }
  
    // 处理RegExp类型
    if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
      return obj1.toString() === obj2.toString();
    }
  
    // 非对象类型比较（string, number, boolean等）
    if (typeof obj1 !== 'object') {
      return obj1 === obj2;
    }
  
    // 获取对象的所有key并排序以便比较
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
  
    // key数量不同直接返回false
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    // 递归比较每个属性值
    for (let i = 0; i < keys1.length; i++) {
      const key = keys1[i];
      
      // key名称不同直接返回false
      if (key !== keys2[i]) {
        return false;
      }
      
      // 递归比较属性值
      if (!deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
  
    return true;
  }

  function deepCloneJSON<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }


  /**
 * 将十六进制颜色值转换为 RGBA 字符串
 * @param hex - 十六进制颜色值，例如 "#ffffff"
 * @param alpha - 透明度，范围 0 - 1，默认为 1
 * @returns 返回 rgba 字符串，例如 "rgba(255, 255, 255, 1)"
 */
function hexToRgba(hex: string, alpha: number = 1): string {
  // 移除 # 符号
  const cleanedHex = hex.replace('#', '');

  // 判断是 3 位还是 6 位十六进制
  const isThreeDigit = cleanedHex.length === 3;

  // 提取 RGB 分量
  const r = parseInt(
    isThreeDigit ? cleanedHex[0] + cleanedHex[0] : cleanedHex.substring(0, 2),
    16
  );
  const g = parseInt(
    isThreeDigit ? cleanedHex[1] + cleanedHex[1] : cleanedHex.substring(2, 4),
    16
  );
  const b = parseInt(
    isThreeDigit ? cleanedHex[2] + cleanedHex[2] : cleanedHex.substring(4, 6),
    16
  );

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 计算矩形中心点
 * @returns 
 */
function GetRectCenter(a1:{x:number,y:number}, a2:{x:number,y:number}){
    // 确保坐标顺序正确
    const minX = Math.min(a1.x, a2.x);
    const maxX = Math.max(a1.x, a2.x);
    const minY = Math.min(a1.y, a2.y);
    const maxY = Math.max(a1.y, a2.y);
    
    // 计算矩形的中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return {x: centerX, y: centerY}
}

export default {
    pointToSegmentDistance,
    distanceBetweenPoints,
    isPointInRectangle,
    getBezierPath,
    deepEqual,
    deepCloneJSON,
    getRectangleDimensions,
    hexToRgba,
    GetRectCenter
};