import { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "./table";
import baseGraph from "./graphs/baseGraph";
import Table from "./table";
import {EraserRes} from "./graphs/baseGraph"
import FreeLine from "./graphs/FreeLine";
import tools, { UndoRedo } from "./tools";
import IconNum from "./iconNum";
import DiyNumberRect from "./DiyNumberRect";

/**
 * 橡皮擦
 * 目前想法是先把每个图形的像素都存起来，然后橡皮擦使用坐标去遍历每一个图形的像素，如果像素相同则删除
 * 如果是遇到圆形等的就
 * 删除还得记得把它堆到撤销中，
 * 
 */

export default class Eraser{
    table: Table;
    freeLine: FreeLine;
    panStyle: PanStyle = {
        // 画笔样式
        type: 'freeLine',
        color: 'rgba(72, 118, 129, 0.747)',
        size: 5
    };
    constructor(table: Table, position: Position) {
        this.table = table
        this.freeLine = new FreeLine(this.panStyle, position)
    }
    moveTo(position: Position){
        const realXY = position.getRealPosition()
        this.freeLine.moveTo(position)
        if (!realXY) {
            return;
        }
        const realPosition = new Position(realXY, PositionType.real)
        let f = false
        f = Eraser.eraserNormalGraph(position, this.table.graphs, this.table)
        const eraserResForIconNum = this.table.iconNum.eraser(realPosition)
        if (eraserResForIconNum.isEraser) {
            this.table.redoList.push(new EraseRedo(this.table.iconNum, Object.assign({},eraserResForIconNum)))
            f = true
        }
        const oldEraserResForDiyNumberRect = tools.deepCloneJSON(this.table.DiyNumberRect.eraserRes)
        const eraserResForDiyNumberRect = this.table.DiyNumberRect.eraser(realPosition)
        if (eraserResForDiyNumberRect.isEraser) {
            this.table.redoList.push(new EraseRedo(this.table.DiyNumberRect, Object.assign({},oldEraserResForDiyNumberRect)))
            
            this.table.DiyNumberRect.draw()
        }
        if (f) {
            this.table.overdrawForBg()
            this.table.drawTopCTX()
        }
        return f
    }
    static eraserNormalGraph(position: Position, graphs:(baseGraph|EraseRedo|UndoRedo)[], table: Table){
        let f = false
        const realXY = position.getRealPosition()
        if (!realXY) {
            return false;
        }
        const realPosition = new Position(realXY, PositionType.real)
        graphs.forEach(graph => {
            if (graph instanceof UndoRedo || graph instanceof EraseRedo) {
                return
            }
            const oldEraserRes = tools.deepCloneJSON(graph.eraserRes)
            const eraserRes = graph.eraser(realPosition)
            if (eraserRes.isEraser && !tools.deepEqual(eraserRes, oldEraserRes)) {
                // 被擦除了的话，得将该操作添加到撤销堆栈中
                console.log(eraserRes, oldEraserRes, graph.eraserRes)
                table.redoList.push(new EraseRedo(graph, Object.assign({},eraserRes)))
                f = true
            }
        })
        return f;
    }
    draw(ctx: UniApp.CanvasContext) { 
        this.freeLine.draw(ctx)
    }
}

/**
 * 为撤销擦除时使用
 * 这个方法会调用被擦除的图形的undo方法
 */
export class EraseRedo{
    graph: baseGraph|IconNum|DiyNumberRect;
    eraserRes: EraserRes;
    constructor(graph: baseGraph|IconNum|DiyNumberRect, eraserRes: EraserRes){
        this.graph = graph;
        this.eraserRes = eraserRes;
    }
    redo(){
        this.graph.undo(this.eraserRes)
    }
}