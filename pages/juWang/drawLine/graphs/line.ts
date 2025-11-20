import baseGraph from "./baseGraph"

import { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"

// 线
export default class Line extends baseGraph {
    end: Position;
    isEnd: boolean = false;
    
    constructor(panStyle:PanStyle, start: Position) { 
        super(panStyle, start)
        const start_matrix = start.getMatrixPosition()
        this.start = new Position(start_matrix.x, start_matrix.y, PositionType.matrix)
        this.end = this.start
    }

    
    eraserRes: EraserRes = {isEraser: false};
    eraser(position: Position):EraserRes {
        if (this.eraserRes.isEraser) {
            return this.eraserRes
        }
        const distance = tools.pointToSegmentDistance(position, this.start, this.end)
        if(distance <= this.panStyle.size){
            this.eraserRes = {isEraser: true}
            return this.eraserRes
        }
        this.eraserRes = {isEraser: false}
        return this.eraserRes
    }
    undo(){
        this.eraserRes = {isEraser: false}
    }


    moveTo(position: Position): void {
        this.end = position
    }
    moveEnd(){
        const end_matrix = this.end.getMatrixPosition()
        this.end = new Position(end_matrix.x, end_matrix.y, PositionType.matrix)
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

            ctx.beginPath()
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(end.x, end.y)
            ctx.closePath()
            ctx.stroke()
        }
    }
}