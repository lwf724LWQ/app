import baseGraph from "./baseGraph"

import { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"



export default class Circle extends baseGraph {
    end: Position;
    isEnd: boolean = false;
    isFill: boolean;
    
    constructor(panStyle:PanStyle, start: Position, isFill: boolean) { 
        super(panStyle, start)
        this.start = start
        this.end = this.start
        this.isFill = isFill
    }

    
    eraserRes: EraserRes = {isEraser: false};
    eraser(position: Position):EraserRes {
        if (this.eraserRes.isEraser) {
            return this.eraserRes
        }
        if (isPointInEllipse(position, this.start, this.end)) {
            console.log('1')
            return this.eraserRes = {isEraser: true}
        }
        return this.eraserRes
    }
    undo(){
        this.eraserRes = {isEraser: false}
    }


    moveTo(position: Position): void {
        this.end = position
    }
    moveEnd(){
        this.isEnd = true
    }
    draw(ctx: UniApp.CanvasContext) {
        if (this.eraserRes.isEraser) {
            return
        }

        const start = this.start.getRealPosition()
        const end = this.end.getRealPosition()

        if (start && end) {
            // 设置画笔样式
            ctx.beginPath()
            ctx.setLineWidth(this.panStyle.size)
            ctx.setStrokeStyle(this.panStyle.color)
            ctx.setFillStyle(tools.hexToRgba(this.panStyle.color, 0.5))

            getMaxEllipsePath(start,end).forEach((point, index) => {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y)
                }else{
                    ctx.lineTo(point.x, point.y)
                }
            })
            ctx.closePath()
            if (this.isFill) {
                ctx.fill()
            }else{
                ctx.stroke()
            }
        }
    }
}
// 实心圆
export class filledCircle extends Circle {
    constructor(panStyle:PanStyle, start: Position){
        super(panStyle, start, true)
    }
}
// 空心圆
export class hollowCircle extends Circle {
    constructor(panStyle:PanStyle, start: Position){
        super(panStyle, start, false)
    }
}


/**
 * 计算矩形内最大椭圆的路径点
 * @param {Object} a1 - 矩形的一个顶点 {x, y}
 * @param {Object} a2 - 矩形的对角顶点 {x, y}
 * @param {number} numPoints - 路径点的数量，默认为100
 * @returns {Array} 包含椭圆路径点的数组
 */
function getMaxEllipsePath(a1:{x:number,y:number}, a2:{x:number,y:number}, numPoints = 100):{x:number,y:number}[] {
    // 确保坐标顺序正确
    const minX = Math.min(a1.x, a2.x);
    const maxX = Math.max(a1.x, a2.x);
    const minY = Math.min(a1.y, a2.y);
    const maxY = Math.max(a1.y, a2.y);
    
    // 计算矩形的中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // 计算椭圆的半轴长度（矩形宽度和高度的一半）
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;
    
    // 生成椭圆路径点
    const points:{x:number,y:number}[] = [];
    for (let i = 0; i < numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        points.push({ x, y });
    }
    
    return points;
}

/**
 * 判断点是否在矩形内最大椭圆中
 * @param {Object} b - 待检测的点 {x, y}
 * @param {Object} a1 - 矩形的一个顶点 {x, y}
 * @param {Object} a2 - 矩形的对角顶点 {x, y}
 * @returns {boolean} 点是否在椭圆内
 */
function isPointInEllipse(b: {x: number, y: number}, a1: {x: number, y: number}, a2: {x: number, y: number}): boolean {
    // 确保坐标顺序正确
    const minX = Math.min(a1.x, a2.x);
    const maxX = Math.max(a1.x, a2.x);
    const minY = Math.min(a1.y, a2.y);
    const maxY = Math.max(a1.y, a2.y);
    
    // 计算矩形的中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // 计算椭圆的半轴长度
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;
    
    // 避免除零错误
    if (radiusX === 0 || radiusY === 0) {
        return false;
    }
    
    // 椭圆方程: ((x - cx)² / rx²) + ((y - cy)² / ry²) <= 1
    const normalizedX = (b.x - centerX) / radiusX;
    const normalizedY = (b.y - centerY) / radiusY;
    
    // 判断点是否在椭圆内
    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
}