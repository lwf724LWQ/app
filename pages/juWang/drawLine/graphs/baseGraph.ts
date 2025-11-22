import { Position, PositionType, PanStyle, TableCanvasContext } from "../table"
// 这里是图形的抽象类
export default abstract class baseGraph {
    panStyle: PanStyle;
    start: Position;
    constructor(panStyle:PanStyle, start: Position) {
        this.panStyle = Object.assign({}, panStyle)
        this.start = start
    }
    eraserRes:EraserRes = {isEraser: false}
    recycle(){}
    eraser(position: Position):EraserRes{throw new Error("未定义擦除方法")}
    undo(eraserRes: EraserRes){}
    touch(position: Position){}
    moveTo(position: Position, type:'touchstart'|'touchmove'|'touchend'){}
    moveEnd(){}
    over(){}// 固定后调用
    draw(ctx: UniApp.CanvasContext){}
}

export interface EraserRes {
    isEraser: Boolean;
    data?: any; // data 由实际的图形管理
}