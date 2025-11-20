import baseGraph from "./baseGraph"

import { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"

/**
 * 
 */


// 文本
export default class Text extends baseGraph {
    end: Position;
    isEnd: boolean = false;
    isFill: boolean;
    
    pointGraph: ControlPoint[] = []
    constructor(panStyle:PanStyle, start: Position) { 
        super(panStyle, start)
        this.start = start
        this.end = this.start
    }

    textValue: string = ''
    confirm(value: string){
        this.textValue = value
        console.log(value)
    }

    isInControlPoint(position: Position){
        const {a1, a2} = this.getRectPoint()
        if (tools.isPointInRectangle(position, a1, a2)) {
            this.setControlPointMode(true)
            this.moveTo(position, 'touchstart')
            return true
        }
        return false
    }
    isControlmode:Boolean = false
    setControlPointMode(mode: Boolean){
        this.isControlmode = mode
    }
    
    eraserRes: EraserRes = {isEraser: false};
    eraser(position: Position):EraserRes {
        if (this.eraserRes.isEraser) {
            return this.eraserRes
        }
        const {a1, a2} = this.getRectPoint()
        if (tools.isPointInRectangle(position, a1, a2)) {
            return this.eraserRes = {isEraser: true}
        }
        return this.eraserRes
    }
    undo(){
        this.eraserRes = {isEraser: false}
    }

    touchVerPosition: Position | null = null
    moveTo(position: Position, type: 'touchstart'|'touchmove'|'touchend'): void {
        if (type === 'touchstart') {
            const realNow = this.end.getRealPosition()
            const realNew = position.getRealPosition()
            if (!realNow || !realNew) {
                return
            }
            this.touchVerPosition = new Position(realNew.x - realNow.x, realNew.y - realNow.y, PositionType.real)
            return
        }else if (type === 'touchmove') { 
            const real = position.getRealPosition()
            if (!real || !this.touchVerPosition) {
                return
            }
            const x = real.x + this.touchVerPosition.x
            const y = real.y + this.touchVerPosition.y
            this.end = new Position(x, y, PositionType.real)
        }else if (type === 'touchend') { 
            this.touchVerPosition = null
        }
        
    }
    moveEnd(){
        this.isEnd = true
    }

    // 获取矩形的对角点
    getRectPoint():{a1:Position, a2:Position} { 
        const w = this.textWidth / 2;
        const end = this.end;
        return {
            a1: new Position(end.x - w, end.y - w, PositionType.real),
            a2: new Position(end.x + w, end.y + w, PositionType.real)
        }
    }

    // 绘制矩形

    drawRect(ctx: UniApp.CanvasContext){
        const {a1, a2} = this.getRectPoint()
        // 设置画笔样式
        ctx.beginPath()
        ctx.setLineWidth(this.panStyle.size)
        ctx.setStrokeStyle(this.panStyle.color)
        ctx.setFillStyle(tools.hexToRgba(this.panStyle.color, 0.5))

        // 使用end坐标计算出矩形的宽高
        const WH = tools.getRectangleDimensions(a1, a2)
        ctx.rect(a1.x,a1.y, WH.width, WH.height)

        ctx.stroke()
        
    }
    getFontSize(){
        return this.panStyle.size * uni.upx2px(30)
    }
    // 绘制文本
    textWidth: number;
    drawText(ctx: UniApp.CanvasContext) { 
        const end = this.end.getRealPosition()

        if (end && this.textValue.length) {
            // 绘制文本
            ctx.beginPath()
            ctx.setFontSize(this.getFontSize())
            ctx.setFillStyle(this.panStyle.color)
            ctx.setTextBaseline('middle')
            ctx.setTextAlign('center')
            ctx.fillText(this.textValue, end.x, end.y)
            this.textWidth = ctx.measureText(this.textValue).width
        }
    }
    // 绘制三个点
    drawPointIcon(ctx: UniApp.CanvasContext) { 
        this.pointGraph.forEach(point => { 
            point.draw(ctx)
        })
    }

    draw(ctx: UniApp.CanvasContext) {
        if (this.eraserRes.isEraser) {
            return
        }
        this.drawText(ctx)
        // this.drawRect(ctx)

        if (this.isControlmode) {
            
            // this.drawPointIcon(ctx)
        }
    }
}


// 
export class ControlPoint extends baseGraph {
    constructor(panStyle:PanStyle, position: Position) { 
        super(panStyle, position)
    }
    // 判断是否点在控制点周围
    isInControlPoint(position: Position) {
        const control = this.start.getRealPosition()
        if (!control)
            return false
        const distance = Math.sqrt(Math.pow(position.x - control.x, 2) + Math.pow(position.y - control.y, 2))
        if (distance < uni.upx2px(30))
            return true
        else
            return false
    }

    draw(ctx, aft?:(a:{x:number,y:number})=>void): void {
        const real = this.start.getRealPosition()
        if (real) {
            ctx.beginPath()
            ctx.arc(real.x, real.y, uni.upx2px(10), 0, 2 * Math.PI)
            ctx.setFillStyle(this.panStyle.color)
            ctx.fill()
            if (aft) {
                aft(real)   
            }
        }
    }
}