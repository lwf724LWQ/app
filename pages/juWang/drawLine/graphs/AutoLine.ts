import baseGraph from "./baseGraph"
import Line from "./line"
import Bezier from "./Bezier"
import colors from "../colors"
import {BezierControl} from "./Bezier"
import Table,{ Position, PositionType, Data, TableFormat, lineData, TableCanvasContext, style, PanStyle, tableStyle, AutolineSetting, getTableNumberStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"
import IconNum from "../iconNum"
import ControlEvent from "../controlEvent"

// 处理多个智能线
export default class AutoLines extends baseGraph {
    panStyle:PanStyle;
    autolineSetting: AutolineSetting;
    data:Data;

    autoLine: AutoLine[] = [];
    lineInterval: number;

    control: BezierControl | null = null;

    iconNum: IconNum;

    table: Table;
    controlEvent: ControlEvent

    graphId = Symbol("autoLine")
    constructor(panStyle:PanStyle, start: Position, autolineSetting: AutolineSetting, data: Data, iconNum: IconNum, controlEvent: ControlEvent, table:Table){
        super(panStyle, start)
        
        this.iconNum = iconNum
        this.table = table

        this.panStyle = panStyle
        this.controlEvent = controlEvent

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
            this.initControlSwitch()
    
            // 初始化擦除
            this.eraserRes = this.eraser(new Position(-99999, -99999, PositionType.real))
        }

    }
    initControlSwitch(){
        const { autolineSetting, panStyle, controlEvent} = this;
        const controlSwitch = autolineSetting.controlSwitch;
        const { lineType } = autolineSetting;

        if (controlSwitch && (lineType == 'bottomBezier' || lineType == 'topBezier')) {
            // 初始化控制点
            const control = new BezierControl(this.autoLine[0].line as Bezier, panStyle, controlEvent, this, this.table)
            this.control = control
        }
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

    isOver = false;
    over(): void {
    }

    moveTo(position: Position): void {
        this.timer ? clearTimeout(this.timer) : ''
        this.timer = null

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
        if (this.control) {
            this.control.moveEnd()
        }
    }
    drawControl(controlCTX: UniApp.CanvasContext){
        if (!this.isOver) {
            this.control?.draw(controlCTX)
            controlCTX.draw()
        }
    }
    draw(lineCTX: UniApp.CanvasContext| false){
        this.autoLine.forEach(item => {
            item.draw(lineCTX)
        })
        if (this.control && lineCTX) {
            const controlCTX = this.table.tableCanvasContext.control_canvas
            this.drawControl(controlCTX)
        }
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

    line: baseGraph | null = null;

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
        if (this.line) {
            // 调用线方法判断是否被擦除
            return this.eraserRes = this.line.eraser(position)   
        }
        return this.eraserRes
    }
    undo(eraserRes: EraserRes){
        if (this.line) {
            this.line.undo(eraserRes)
            this.eraserRes = eraserRes   
        }
    }

    moveTo(position: Position): void {
        if (this.line) {
            this.line.moveTo(position, 'touchmove')   
        }
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
        if (this.line) {
            this.line.moveEnd()   
        }
    }
    draw(lineCTX: UniApp.CanvasContext | false){
        if (lineCTX && this.end && this.line) {
            this.line.draw(lineCTX)
        }
    }
}