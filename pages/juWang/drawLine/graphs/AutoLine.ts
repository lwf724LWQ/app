import baseGraph from "./baseGraph"
import Line from "./line"
import Bezier from "./Bezier"
import colors from "../colors"
import {BezierControl} from "./Bezier"
import { Position, PositionType, Data, TableFormat, lineData, TableCanvasContext, style, PanStyle, tableStyle, AutolineSetting, getTableNumberStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"
// 处理多个智能线
export default class extends baseGraph {
    autolineSetting: AutolineSetting;
    data:Data;

    autoLine: AutoLine[] = [];
    lineInterval: number;

    control: BezierControl | null = null;

    constructor(panStyle:PanStyle, start: Position, autolineSetting: AutolineSetting, data: Data){
        super(panStyle, start)
        this.autolineSetting = autolineSetting;
        this.data = data;
        const { panCount, isMoreColor, interval, controlSwitch, lineType } = autolineSetting;
        const { lineHeight } = tableStyle;
        let colorIndex = colors.findIndex(item => item.color === panStyle.color) || 0;
        const lineInterval = this.lineInterval = interval*lineHeight;
        const real_start = start.getRealPosition()

        for (let index = 0; index < panCount; index++) {
            const newStart = new Position(real_start.x, real_start.y + (lineInterval * index), PositionType.real)
            const newPanStyle = Object.assign({}, panStyle, {color: isMoreColor ? panStyle.color : colors[colorIndex].color})
            this.autoLine.push(new AutoLine(newPanStyle, newStart, autolineSetting, data))

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
    draw(lineCTX: UniApp.CanvasContext| false, iconCTX?: UniApp.CanvasContext){
        this.autoLine.forEach(item => {
            item.draw(lineCTX, iconCTX)
        })
    }
}

interface EraserResForAutoLineList extends EraserRes {
    data: EraserResForAutoLine[];
}

interface EraserResForAutoLine extends EraserRes {
    data: {
        startArc: Boolean;
        endArc: Boolean;
        lineIsEraser: EraserRes
    };
}

// 智能线
class AutoLine extends baseGraph {
    
    end: Position | null = null
    isEnd: boolean = false
    autolineSetting: AutolineSetting;
    data:Data;

    line: baseGraph;
    constructor(panStyle:PanStyle, start: Position, autolineSetting: AutolineSetting, data: Data) { 
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
    }
    
    // 擦除相关
    eraserRes: EraserResForAutoLine = {isEraser: false, data:{startArc: false, endArc: false, lineIsEraser: {isEraser: false}}};
    eraser(position: Position):EraserResForAutoLine {
        // 调用线方法判断是否被擦除
        const lineIsEraser = this.line.eraser(position)
        
        // 判断是否擦到圆
        // 判断头
        const eraserRes = Object.assign({},this.eraserRes)
        const data = Object.assign({}, this.eraserRes.data)
        const startD = tools.distanceBetweenPoints(this.start, position)
        data.lineIsEraser = lineIsEraser
        if (startD <= this.startArcR) {
            data.startArc = true
        }
        if (this.end) {
            const endD = tools.distanceBetweenPoints(this.end, position)
            if (endD <= this.endArcR) {
                data.endArc = true
            }
        }
        
        const newEraserRes = Object.assign({}, eraserRes, {isEraser: (lineIsEraser || eraserRes.data.startArc || eraserRes.data.endArc), data}) 
        this.eraserRes = newEraserRes
        return newEraserRes
    }
    undo(eraserRes: EraserResForAutoLine){
        this.line.undo({isEraser: false})

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
            }
        }
        this.isEnd = true
        this.line.moveEnd()
    }
    // 画圆
    drawCircle(ctx: UniApp.CanvasContext, position: Position) {
        const panStyle = this.panStyle
        const matrix = position.getMatrixPosition()
        const real = position.getRealPosition()
        const numStyleList = getTableNumberStyle()
        const number = this.data[matrix.y]?.number[matrix.x] || ''
        if(!real){
            return 0
        }
        const lineWidth = uni.upx2px(8)

        // 获取这格的大小,并取短边作为直径
        const numStyle = numStyleList[matrix.x]
        const w = numStyle.width
        const h = tableStyle.lineHeight
        const r = ((w>h?h:w)/2) - lineWidth
        
        // 先画底部的圆
        ctx.beginPath()
        ctx.setShadow(0, 0, uni.upx2px(30), '#000')
        ctx.arc(real.x, real.y, r, 0, 2 * Math.PI)
        ctx.setFillStyle(panStyle.color)
        ctx.fill()

        ctx.beginPath()
        ctx.setLineWidth(lineWidth)
        ctx.setStrokeStyle("#fff")
        ctx.setShadow(0, 0, 0, '#000')
        ctx.arc(real.x, real.y, r, 0, 2 * Math.PI)
        ctx.stroke()

        ctx.setFontSize(numStyle.textSize)
        ctx.setFillStyle("#fff")
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')
        ctx.fillText(number.toString(), real.x, real.y)

        return r
    }
    startArcR:number = 0;
    endArcR:number = 0;
    draw(lineCTX: UniApp.CanvasContext | false, iconCTX?: UniApp.CanvasContext){
        if (lineCTX && this.end) {
            // const start = this.start.getMatrixPosition()
            // const end = this.end.getMatrixPosition()
            // if (start.x != end.x || start.y != end.y) {
                this.line.draw(lineCTX)
            // }
        }
        
        if (iconCTX) {
            if (!this.eraserRes.data.startArc) {
                this.startArcR = this.drawCircle(iconCTX, this.start)   
            }
            if (this.end && this.isEnd && !this.eraserRes.data.endArc) {
                this.endArcR = this.drawCircle(iconCTX, this.end)   
            }
        }
    }
}