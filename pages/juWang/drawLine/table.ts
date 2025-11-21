import baseGraph from "./graphs/baseGraph";
import Background from "./graphs/Background";
import FreeLine from "./graphs/FreeLine";
import Line from "./graphs/line";
import AutoLine from "./graphs/autoLine";
import Eraser from "./eraser";
import {EraseRedo} from "./eraser";
import {filledRect, hollowRect} from "./graphs/Rect";
import { filledCircle, hollowCircle } from "./graphs/Circle";
import Text from "./graphs/Text"
import tools from "./tools"
import IconNum from "./iconNum";
import DiyNumberRect from "./DiyNumberRect"

export interface TableCanvasContext {
    bg_canvas: UniApp.CanvasContext; // 该canvas用于画背景以及导出
    line_canvas: UniApp.CanvasContext; // 该canvas用于画线
    topicon_canvas: UniApp.CanvasContext; // 该canvas用于画顶部图标
    diyNumber_canvas: UniApp.CanvasContext; // 该canvas用于画数字选择器的高级面板中的东西
    control_canvas: UniApp.CanvasContext;
}
// 坐标及高宽，样式属性
export interface style { 
    left: number,
    width: number,
    textColor: string,
    textSize: number,
    bgColor: string
}
// 表格格式
export interface TableFormat { 
    width: number,
    height: number,
    lineHeight: number,
    dateInfo: style,
    number1: style,
    number2: style,
    number3: style,
    number4: style,
    number5: style,
    number6: style,
}
export type Data = lineData[];
// 行数据
export interface lineData {
    id: string,
    tname: string,
    issueno: string,
    number: (number|string)[],
    refernumber: string,
    opendate: string,
    isWrite: Boolean,
    createTime: string
}

// 绘制基本颜色
export interface PanStyle {
    type: 'autoLine' | 'line' | 'freeLine' | 'text' | 'eraser' | 'filledCircle' | 'filledRect' | 'hollowCircle' | 'hollowRect';
    color: string;
    size: number;
}

// 智能笔配置
export interface AutolineSetting {
    controlSwitch: Boolean; // 是否使用控制点
    lineType: 'topBezier' | 'bottomBezier' | 'line';
    isMoreColor: Boolean; // 是否多彩
    interval: number; // 多笔下间隔
    panCount: number; // 多笔笔数
}

// 这里有点危险，如果后续有多个不同格式的表格，这里会被覆盖导致错误
export let tableStyle: TableFormat;

export const graphClass = {
    line: Line,
    freeLine: FreeLine,
    filledRect: filledRect,
    hollowRect: hollowRect,
    filledCircle: filledCircle,
    hollowCircle: hollowCircle
}

export function getTableNumberStyle(){
    return [tableStyle.number1,tableStyle.number2,tableStyle.number3,tableStyle.number4,tableStyle.number5,tableStyle.number6]
}

export interface TouchEvent {
    type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
    x: number | undefined;
    y: number | undefined;
}

export type numberType = "单" | "双" | "大" | "小" | "X" | "中肚合" | "千百合" | "百个合" | "杀" | "稳码";
// 数字选择器返回格式
interface AdvancedNumberSelectData {
    type: "advanced";
    XY: {x: number, y: number};
    data: {
        type: numberType;
        numbers: string[];
    };
}

interface SimpleNumberSelectData {
    type: "simple";
    XY: {x: number, y: number};
    data: {
        string: string;
    };
}

export type numberSelectData = AdvancedNumberSelectData | SimpleNumberSelectData;


/**
 * 表格
 * 
 * 
 */
export default class Table {
    canvasId:{bg_canvas: string, line_canvas: string, topicon_canvas: string};
    tableCanvasContext: TableCanvasContext;

    // 画布
    width: number;
    height: number;

    bg: baseGraph; // 背景图形

    graphs:baseGraph[] = []; // 固定绘制到低层画布的图形
    topIconGraphList: baseGraph[] = []; // 顶部图层的图形
    drawNowGraph: baseGraph|Eraser|null = null; // 目前正在绘制的图形
    redoList:(baseGraph|EraseRedo)[] = []; // 撤销堆栈

    tableformat: TableFormat; // 表格配置

    panStyle: PanStyle; // 笔基础配置

    autolineSetting: AutolineSetting; // 智能笔设置

    timer: number|NodeJS.Timeout = 0;
    
    data: Data
    iconNum: IconNum;
    DiyNumberRect: DiyNumberRect;
    openTextInput: Function; // 打开输入框的
    openNumberSelect: Function; // 打开数字选择框的
    constructor(canvasId: {bg_canvas: string, line_canvas: string, topicon_canvas: string, control_canvas: string, diyNumber_canvas: string}, width: number, height: number, panStyle: PanStyle,data: Data, autolineSetting: AutolineSetting, openTextInput: Function, openNumberSelect:Function){
        this.canvasId = canvasId;
        this.width = width
        this.height = height
        this.data = data
        this.tableCanvasContext = {
            bg_canvas: uni.createCanvasContext(canvasId.bg_canvas),
            line_canvas: uni.createCanvasContext(canvasId.line_canvas),
            topicon_canvas: uni.createCanvasContext(canvasId.topicon_canvas),
            control_canvas: uni.createCanvasContext(canvasId.control_canvas),
            diyNumber_canvas: uni.createCanvasContext(canvasId.diyNumber_canvas)
        }
        this.panStyle = Object.assign({}, panStyle)

        this.tableformat = this.initStyleObj()
        tableStyle = this.tableformat;
        this.bg = new Background(panStyle, this.tableformat, data)
        this.bg.draw(this.tableCanvasContext.bg_canvas)

        this.autolineSetting = autolineSetting

        const context = this.tableCanvasContext
        context.bg_canvas.draw()

        this.openTextInput = openTextInput

        this.iconNum = new IconNum(this.tableCanvasContext.topicon_canvas, data)
        this.DiyNumberRect = new DiyNumberRect(this.tableCanvasContext.diyNumber_canvas, this, data)

        this.openNumberSelect = openNumberSelect
    }

    // 输入文本
    isTextInputMode = false
    textInput(value: string){
        if (value.length && this.drawNowGraph instanceof Text) {
            this.drawNowGraph.confirm(value)
        }
        
        this.isTextInputMode = false
        this.draw()
    }

    // 初始化表单格式
    initStyleObj(): TableFormat {
        const tableWidth = this.width;
        const tableHeight = this.height;
        const t = tableWidth;
        const lineHeight = t * 0.1162;
        const number_fontSize = t * 0.08;
        const dateInfo: style = { 
            left: 0,
            width: t * 0.1893,
            textColor: '#fff',
            textSize: 0.0426 * t,
            // textSize2: 0.0266 * t,
            bgColor: '#93c385'
        }
        const number1: style = { 
            left: dateInfo.width,
            width: t * 0.0790,
            textColor: '#a3c199',
            textSize: 0.0426 * t,
            bgColor: '#eff9ca'
        }
        
        const number2_6_width = (tableWidth - number1.left - number1.width) / 5;
        const number2_6_color = '#93c385'
        const number2_6_bgcolor = '#fff'
        const number2: style = { 
            left: number1.left + number1.width,
            width: number2_6_width,
            textColor: number2_6_color,
            textSize: number_fontSize,
            bgColor: number2_6_bgcolor
        }
        const number3: style = { 
            left: number2.left + number2_6_width,
            width: number2_6_width,
            textColor: number2_6_color,
            textSize: number_fontSize,
            bgColor: number2_6_bgcolor
        }
        const number4: style = { 
            left: number3.left + number2_6_width,
            width: number2_6_width,
            textColor: number2_6_color,
            textSize: number_fontSize,
            bgColor: number2_6_bgcolor
        }
        const number5: style = { 
            left: number4.left + number2_6_width,
            width: number2_6_width,
            textColor: number2_6_color,
            textSize: number_fontSize,
            bgColor: number2_6_bgcolor
        }
        const number6: style = { 
            left: number5.left + number2_6_width,
            width: number2_6_width,
            textColor: '#a3c199',
            textSize: number_fontSize,
            bgColor: '#eff9ca'
        }
        return {
            width: tableWidth,
            height: tableHeight,
            lineHeight,
            dateInfo,
            number1,
            number2,
            number3,
            number4,
            number5,
            number6

    }
    }
    
    // 设置笔样式
    setPanStyle(panStyle: PanStyle) {
        this.panStyle = Object.assign({}, panStyle)
        this.cleaDraw()
        this.overdrawForBg()
        this.draw()
    }
    // 设置智能笔样式
    setAutolineSetting(autolineSetting: AutolineSetting){
        this.autolineSetting = Object.assign({}, autolineSetting)
    }
    //
    isTouching = false;
    touchStartPosition: Position | null = null;
    lastTouchPosition: Position | null = null;
    touchEvent(touche: TouchEvent) {
        const tableCanvasContext = this.tableCanvasContext;
        const panStyle = this.panStyle
        
        const position = new Position(touche.x || 0, touche.y || 0, PositionType.real)
        clearTimeout(this.timer)
        switch (touche.type) {
            case 'touchstart':
                if(!touche) break;
                if(touche.x && touche.x <= this.tableformat.dateInfo.width) break;
                this.touchStartPosition = position
                this.lastTouchPosition = position
                
                
            case 'touchmove':
                if(!touche) break;
                if(touche.x && touche.x <= this.tableformat.dateInfo.width) break;
                
                if (this.isTouching) {
                    this.lastTouchPosition = position
                    this.drawNowGraph?.moveTo(position, 'touchmove')
                }else{
                    if (this.touchStartPosition && tools.distanceBetweenPoints(this.touchStartPosition,position)>5) {
                        this.isTouching = true
                        if (this.drawNowGraph instanceof AutoLine || this.drawNowGraph instanceof Text){
                            // 如果是智能线，判断一下是否为点到控制点
                            if (this.drawNowGraph.isInControlPoint(position)) {
                                // 如果是点到智能线控制点的话，这里创建新的图形
                                // 由后面的touchmove处理
                                // this.drawNowGraph.setControlPointMode(true)
                                console.log('进到编辑')
                                break;
                            }
                        }
                        if (panStyle.type === 'eraser'){
                            this.drawNowGraph = new Eraser(this, position);
                        }else if (panStyle.type === 'autoLine') {
                            this.cleaDraw()
                            this.overdrawForBg()
                            // 智能线特殊处理
                            const graph = new AutoLine(panStyle, position, this.autolineSetting, this.data, this.iconNum)
                            this.drawNowGraph = graph
        
                            this.drawTopCTX()
                        }else{
                            // 其他图形
                            const graph = graphClass[panStyle.type]
                            if (graph) {
                                this.cleaDraw()
                                this.overdrawForBg()
                                this.drawNowGraph = new graph(panStyle, position)
                            }
                        }
                    }
                }
                
                break;
            case "touchend":
                this.isTouching = false
                if ((this.touchStartPosition && this.lastTouchPosition && tools.distanceBetweenPoints(this.touchStartPosition,this.lastTouchPosition)<5) && !(['eraser'].includes(this.panStyle.type))) {
                    if (this.panStyle.type == 'text') {
                        this.drawNowGraph = new Text(panStyle, this.lastTouchPosition)
                        this.openTextInput()
                    }else{
                        // 这里判断是否为可填写行
                        const data = this.data;
                        const m = this.lastTouchPosition.getMatrixPosition()
                        if (data[m.y]?.isWrite === true){
                            // 判断为可写入时，调起页面填写
                            const placeValue = ["小","千","百","十","个","末"][m.x]
                            this.openNumberSelect(placeValue, m)
                        }else{
                            this.iconNum.tap(this.lastTouchPosition,this.panStyle)
                            this.drawTopCTX()
                        }
                    }
                }
                if (this.drawNowGraph instanceof baseGraph) {
                    this.drawNowGraph.moveEnd()
                }
                this.setTimer()

                if (this.drawNowGraph instanceof AutoLine) {
                    // 这里AutoLine会添加顶层图标等需要把顶层重新绘制一次
                    this.drawTopCTX()
                }

                if (this.drawNowGraph instanceof Eraser) {
                    this.drawNowGraph = null
                    this.tableCanvasContext.control_canvas.draw()
                }
                break;
            case "touchcancel":
                // this.drawNowGraph = null
                // 从graphs中删除最后一个
                // this.graphs.pop()
                break;
        }
        this.draw()
    }

    // 设置一个定时器，一定时间后，将线绘制到背景中
    setTimer() {
        this.timer = setTimeout(() => {
            this.cleaDraw()
            this.overdrawForBg()
            this.drawTopCTX()
            this.tableCanvasContext.control_canvas.draw()
            this.draw()
        }, 2500)
    }
    // 将绘制中的图形固定到graphs
    cleaDraw(){
        // 判断是否有绘制中的图像
        if (this.drawNowGraph && this.drawNowGraph instanceof baseGraph) {
            this.graphs.push(this.drawNowGraph)
        }
        this.drawNowGraph = null
    }

    // 完全重新绘制一次背景,并将绘制中的图像也绘制上去
    overdrawForBg(drawBefore?:Function){
        const bgCTX = this.tableCanvasContext.bg_canvas

        this.bg.draw(bgCTX)
        this.graphs.forEach(graph => {
            graph.over()
            graph.draw(bgCTX)
        })
        if (drawBefore) {
            drawBefore()
        }
        bgCTX.draw()
    }
    // 撤销上一步操作
    undo(){
        if(this.drawNowGraph){
            if (this.drawNowGraph instanceof Eraser) {
                this.drawNowGraph = null;
                return this.undo()
            }
            this.redoList.push(this.drawNowGraph)
            this.drawNowGraph = null
            this.draw()
            this.drawTopCTX()
        }else if(this.graphs.length){
            const lastGraph = this.graphs.pop()
            if (lastGraph) {
                this.drawNowGraph = lastGraph
            }
            // 每次操作图形数组后都要重新绘制一次背景
            this.overdrawForBg()
            this.drawTopCTX()
            this.draw()
        }
        
    }
    
    // 恢复已撤销的操作
    redo(){
        if(this.redoList.length){
            const lastGraph = this.redoList.pop()
            if (lastGraph) {
                if (lastGraph instanceof EraseRedo) {
                    lastGraph.redo()
                }
                else if (this.drawNowGraph instanceof baseGraph) {
                    this.graphs.push(this.drawNowGraph)
                    this.drawNowGraph = lastGraph
                }else{
                    this.drawNowGraph = lastGraph
                }
                // 每次操作图形数组后都要重新绘制一次背景
                this.overdrawForBg()
                this.drawTopCTX()
                this.draw()
            }
        }
    }
    // 清除画布内容
    clear(){
        if (this.graphs.length) {
            // this.redoList.push(...this.graphs)
            this.graphs = []
        }
        if (this.drawNowGraph) {
            // this.redoList.push(this.drawNowGraph)
            this.drawNowGraph = null;
        }
        if (this.topIconGraphList.length) {
            this.topIconGraphList = []
        }
        // 每次操作图形数组后都要重新绘制一次背景
        this.overdrawForBg()
        this.drawTopCTX()
        this.tableCanvasContext.control_canvas.draw()
        this.draw()
    }

    // 保存绘制作品
    async save() {
        uni.showLoading({title: "保存中"})
        const tempFilePath = await this.outBase64()
        //#ifdef H5
        const base64 = tempFilePath, fileName = "canvas.jpg";
        
        const blob = base64ToBlob(base64);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        
        // 释放URL资源
        URL.revokeObjectURL(link.href);
        uni.hideLoading()
        //#endif
        //#ifdef APP-PLUS
        uni.saveFile({
            tempFilePath: tempFilePath,
            success: function (result) {
                console.log('保存成功，文件路径：', result.savedFilePath);
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
                uni.hideLoading()
            },
            fail: function (err) {
                console.error('保存失败：', err);
                uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
                uni.hideLoading()
            }
        });
        //#endif
        
    }

    // outBase64
    outBase64():Promise<string>{
        return new Promise((resolve) => {
            // 清除定时器
            clearTimeout(this.timer)

            // 将目前绘制中的固定到gr列表
            this.cleaDraw()
            
            // 将顶部图层绘制到底部然后导出
            this.overdrawForBg(()=>{
                const tableCanvasContext = this.tableCanvasContext;
                const bgCTX = tableCanvasContext.bg_canvas
                this.graphs.forEach(graph => {
                    if (graph instanceof AutoLine) {
                        graph.draw(false, bgCTX)
                    }
                })
            })

            uni.canvasToTempFilePath({
                canvasId: this.canvasId.bg_canvas, // 替换为实际的canvas ID
                success: (res) => {
                    this.overdrawForBg();
                    resolve(res.tempFilePath)
                },
                fail: (err) => {
                    console.error('转换临时文件失败：', err);
                    uni.hideLoading()
                }
            });


            //**
            // context.drawImage(res.tempFilePath, 48, 48)
            // context.restore()
            // context.draw()
            
            
            
        })
    }

    numberSelect(res: numberSelectData){
        this.DiyNumberRect.handleConfirm(res)
    }

    // 重新绘制顶层
    drawTopCTX(){
        // 这里需要把顶层重新绘制一次
        const tableCanvasContext = this.tableCanvasContext;
        const topCTX = tableCanvasContext.topicon_canvas
        this.iconNum.draw()
        topCTX.draw()
        // const tableCanvasContext = this.tableCanvasContext;
        // const topCTX = tableCanvasContext.topicon_canvas
        // const lineCTX = tableCanvasContext.line_canvas
        // this.graphs.forEach(graph => {
        //     if (graph instanceof AutoLine) {
        //         graph.draw(false, topCTX)
        //     }
        // })
        // if (this.drawNowGraph instanceof AutoLine) {
        //     this.drawNowGraph?.draw(lineCTX, topCTX)
        // }
        // topCTX.draw()
    }

    draw() {
        if (this.drawNowGraph instanceof AutoLine) {
            this.drawNowGraph.drawControl(this.tableCanvasContext.control_canvas)
            this.tableCanvasContext.control_canvas.draw()
        }
        if (this.drawNowGraph instanceof baseGraph) {
            this.drawNowGraph.draw(this.tableCanvasContext.line_canvas)   
        }

        if (this.drawNowGraph instanceof Eraser) {
            this.drawNowGraph.draw(this.tableCanvasContext.control_canvas)
            this.tableCanvasContext.control_canvas.draw()
        }
        
        this.tableCanvasContext.line_canvas.draw()
    }

}

export enum PositionType { 
    real,
    matrix
}


export class Position {
    x: number;
    y: number;
    type: PositionType;
    styleObj:TableFormat = tableStyle;

    constructor(xy: {x: number|string, y: number|string}, type:PositionType)
    constructor(x: number, y: number, type:PositionType)
    constructor(x: number | {x: number|string, y: number|string}, y: number|PositionType, type?:PositionType) {
        if (typeof x === 'object' && !isNaN(Number(x.x)) && !isNaN(Number(x.y))) {
            this.x = Number(x.x)
            this.y = Number(x.y)
            this.type = y
        }else if ((typeof x === 'number') && (typeof y === 'number')) {
            this.x = x
            this.y = y
        }
        if (type === PositionType.real || type === PositionType.matrix) {
            this.type = type
        }
    }
    getRealPosition() { 
        if (this.type == PositionType.real)
            return {x: this.x, y: this.y}

        const styleObj = this.styleObj;
        const y = this.y * this.styleObj.lineHeight;
        let numberStyle:style = getTableNumberStyle()[this.x];
        if (numberStyle == undefined) {
            console.log('error: x is out of range')
            return false
        }
        const halfHeigth = styleObj.lineHeight / 2
        const halfWidth = numberStyle.width / 2
        return {x: numberStyle.left + halfWidth, y: y + halfHeigth}
    }
    getMatrixPosition(){
        if (this.type == PositionType.matrix){
            return {x: this.x, y: this.y}
        }
        const styleObj = this.styleObj
        const realX = this.x;
        const x = getTableNumberStyle()
            .findIndex((style, index) => {
                // 判断是否在着一格中
                if (style.left <= realX && realX <= (style.left + style.width)) {
                    return true
                }
            })

        return{
            x,
            y: Math.floor(this.y / styleObj.lineHeight)
        }
    }
}

// 将Base64数据转换为Blob对象
function base64ToBlob(base64Data) {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; i++) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
}