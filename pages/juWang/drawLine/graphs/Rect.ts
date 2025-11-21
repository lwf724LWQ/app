import baseGraph from "./baseGraph"

import { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"



// 矩形
export default class Rect extends baseGraph {
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
        if (tools.isPointInRectangle(position, this.start, this.end)) {
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
    

    draw(ctx: UniApp.CanvasContext, alpha=0.5) {
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
            ctx.setFillStyle(tools.hexToRgba(this.panStyle.color, alpha))

            // 找到矩形的边界坐标
            const a1 = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            }
            const a2 = {
                x: Math.max(start.x, end.x),
                y: Math.max(start.y, end.y)
            }

            // 使用end坐标计算出矩形的宽高
            const WH = tools.getRectangleDimensions(a1, a2)
            ctx.rect(a1.x,a1.y, WH.width, WH.height)

            if (this.isFill) {
                ctx.fill()
            }else{
                ctx.stroke()
            }
        }
    }
}
// 实心矩形
export class filledRect extends Rect {
    constructor(panStyle:PanStyle, start: Position){
        super(panStyle, start, true)
    }
}
// 空心矩形
export class hollowRect extends Rect {
    constructor(panStyle:PanStyle, start: Position){
        super(panStyle, start, false)
    }
}
