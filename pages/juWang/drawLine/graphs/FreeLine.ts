import baseGraph from "./baseGraph";
import { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"

export default class FreeLine extends baseGraph {
    linePaths: Position[] = [];
    constructor(panStyle:PanStyle, start: Position){
        super(panStyle, start);
        this.linePaths.push(start)
    }


    eraserRes: EraserRes = {isEraser: false};
    eraser(position: Position):EraserRes {
        if (this.eraserRes.isEraser) {
            return this.eraserRes
        }
        let start = this.linePaths[0]
        let f = false
        for (let index = 1; index < this.linePaths.length; index++) {
            const end = this.linePaths[index]
            const distance = tools.pointToSegmentDistance(position, start, end)
            if(distance <= this.panStyle.size){
                f = true;
                continue;
            }
            start = end;
        }
        
        this.eraserRes = {isEraser: f}
        return this.eraserRes
    }
    undo(){
        this.eraserRes = {isEraser: false}
    }


    moveTo(position: Position): void {
        this.linePaths.push(position)
    }
    draw(ctx: UniApp.CanvasContext): void {
        if (this.eraserRes.isEraser) {
            return
        }

        const length = this.linePaths.length;
        if (length == 1) {
            return
        }
        let f = true

        // 设置画笔样式
        ctx.beginPath()
        ctx.setLineWidth(this.panStyle.size)
        ctx.setStrokeStyle(this.panStyle.color)
        this.linePaths.forEach((position, index) => {
            const realXY = position.getRealPosition()
            if (!realXY) {
                console.log('position.getRealPosition() is null')
                return
            }
            if (f) {
                ctx.moveTo(realXY.x, realXY.y)
                f = false
            } else {
                ctx.lineTo(realXY.x, realXY.y)
            }
        })
        ctx.stroke()
    }
}
