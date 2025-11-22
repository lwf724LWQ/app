import baseGraph from "./baseGraph"
import Line from "./line"
import Bezier from "./Bezier"
import colors from "../colors"
import {BezierControl} from "./Bezier"
import { Position, PositionType, Data, TableFormat, lineData, TableCanvasContext, style, PanStyle, tableStyle, AutolineSetting, getTableNumberStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"
import IconNum from "../iconNum"

// 处理多个智能线
export default class extends baseGraph {
    autolineSetting: AutolineSetting;
    data:Data;

    autoLine: AutoLine[] = [];
    lineInterval: number;

    control: BezierControl | null = null;

    iconNum: IconNum;
    constructor(panStyle:PanStyle, start: Position, autolineSetting: AutolineSetting, data: Data, iconNum: IconNum){
        super(panStyle, start)
        this.autolineSetting = autolineSetting;
        this.data = data;
        const { panCount, isMoreColor, interval, controlSwitch, lineType } = autolineSetting;
        const { lineHeight } = tableStyle;
        let colorIndex = colors.findIndex(item => item.color === panStyle.color) || 0;
        const lineInterval = this.lineInterval = interval*lineHeight;
        const real_start = start.getRealPosition()
        if (real_start) {
            for (let index = 0; index < panCount; index++) {
                const newStart = new Position(real_start.x, real_start.y + (lineInterval * index), PositionType.real)
                const newPanStyle = Object.assign({}, panStyle, {color: isMoreColor ? panStyle.color : colors[colorIndex].color})
                this.autoLine.push(new AutoLine(newPanStyle, newStart, autolineSetting, data, iconNum))
    
                colorIndex++
            }
            if (controlSwitch && (lineType == 'bottomBezier' || lineType == 'topBezier')) {
                // 初始化控制点
                const control = new BezierControl(this.autoLine[0].line as Bezier, panStyle)
                this.control = control
            }
    
            // 初始化擦除
            this.eraserRes = this.eraser(new Position(-99999, -99999, PositionType.real))
        }

        this.iconNum = iconNum
    }


    // 擦除相关
    eraserRes: EraserResForAutoLineList = {isEraser: false, data:[]};
    eraser(position: Position):EraserResForAutoLineList {
        const resList = this.autoLine.map(item => item.eraser(position))
        this.eraserRes = {
            isEraser: resList.findIndex(item => item.isEraser) >= 0,
            data: resList
        }
        return this.eraserRes
    }
    undo(eraserRes: EraserResForAutoLineList){
        this.autoLine.forEach((item, index) => item.undo(eraserRes.data[index]))
    }


    isInControlPoint(position: Position) { 
        if (this.control?.isInControlPoint(position)) {
            this.setControlPointMode(true)
            return true
        }
        return false
    }
    // 设置是否为控制点模式
    isControlPointMode:Boolean = false;
    setControlPointMode(mode: Boolean){
        this.isControlPointMode = mode
    }
    isOver = false;
    over(): void {
        this.setControlPointMode(false)
        this.isOver = true
    }

    moveTo(position: Position): void {
        if (this.isControlPointMode) {
            this.control?.moveTo(position)
            return
        }
        const lineInterval = this.lineInterval
        this.autoLine.forEach((item, index) => {
            const newPosition = new Position(position.x, position.y + (lineInterval * (index)), PositionType.real)
            item.moveTo(newPosition)
        })
    }
    
    moveEnd(){
        this.autoLine.forEach(item => {
            item.moveEnd()
        })

        if (this.autoLine.length === 1) {
            if (!this.autoLine[0].end) {
                this.over()
            }
        }
    }
    drawControl(controlCTX: UniApp.CanvasContext){
        if (!this.isOver) {
            this.control?.draw(controlCTX)   
        }
    }
    draw(lineCTX: UniApp.CanvasContext| false){
        this.autoLine.forEach(item => {
            item.draw(lineCTX)
        })
    }
}

interface EraserResForAutoLineList extends EraserRes {
    data: EraserRes[];
}

// 智能线
class AutoLine extends baseGraph {
    
    end: Position | null = null
    isEnd: boolean = false
    autolineSetting: AutolineSetting;
    data:Data;

    line: baseGraph;

    iconNum: IconNum;
    constructor(panStyle:PanStyle, start: Position, autolineSetting: AutolineSetting, data: Data, iconNum: IconNum) { 
        super(panStyle, start)
        const start_matrix = start.getMatrixPosition()
        this.start = new Position(start_matrix.x, start_matrix.y, PositionType.matrix)
        this.autolineSetting = autolineSetting
        this.data = data
        if (autolineSetting.lineType === 'line') {
            this.line = new Line(panStyle, this.start)
        }else if (autolineSetting.lineType === 'topBezier') {
            this.line = new Bezier(panStyle, this.start, 'left')
        }else if (autolineSetting.lineType === 'bottomBezier'){
            this.line = new Bezier(panStyle, this.start, 'right')
        }
        this.iconNum = iconNum
        iconNum.addIcon(start, panStyle, true)
        
    }
    
    // 擦除相关
    eraserRes: EraserRes = {isEraser: false};
    eraser(position: Position):EraserRes {
        // 调用线方法判断是否被擦除
        return this.eraserRes = this.line.eraser(position)
    }
    undo(eraserRes: EraserRes){
        this.line.undo(eraserRes)
        this.eraserRes = eraserRes
    }

    moveTo(position: Position): void {
        this.line.moveTo(position, 'touchmove')
        const position_matrix = position.getMatrixPosition()
        this.end = new Position(position_matrix.x, position_matrix.y, PositionType.matrix)
    }
    moveEnd(){
        const start = this.start.getMatrixPosition()
        
        if (this.end) {
            const end = this.end.getMatrixPosition()
            if (start.x == end.x && start.y == end.y) {
                this.end = null
            }else{
                this.iconNum.addIcon(this.end, this.panStyle, true)
                this.iconNum.draw()
            }
        }
        this.isEnd = true
        this.line.moveEnd()
    }
    draw(lineCTX: UniApp.CanvasContext | false){
        if (lineCTX && this.end) {
            this.line.draw(lineCTX)
        }
    }
}