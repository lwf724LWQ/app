import baseGraph from "./graphs/baseGraph";
import Background from "./graphs/Background";
import FreeLine from "./graphs/FreeLine";
import Line from "./graphs/line";
import AutoLines from "./graphs/autoLine";
import Eraser from "./eraser";
import {EraseRedo} from "./eraser";
import {filledRect, hollowRect} from "./graphs/Rect";
import { filledCircle, hollowCircle } from "./graphs/Circle";
import Text from "./graphs/Text"
import tools from "./tools"
import IconNum from "./iconNum";
import DiyNumberRect from "./DiyNumberRect"
import { UndoRedo } from "./tools";
import ControlEvent, {ClickGraph} from "./controlEvent";
import { text } from "stream/consumers";

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
export interface AdvancedNumberSelectData {
    type: "advanced";
    XY: {x: number, y: number};
    data: {
        type: numberType;
        numbers: string[];
    };
}

export interface SimpleNumberSelectData {
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
    canvasId:{bg_canvas: string, line_canvas: string, topicon_canvas: string, control_canvas: string, diyNumber_canvas: string};
    tableCanvasContext: TableCanvasContext;

    // 画布
    width: number;
    height: number;

    bg: baseGraph; // 背景图形

    graphs:(baseGraph|UndoRedo|EraseRedo)[] = []; // 绘制到低层画布的图形
    drawNowGraph: baseGraph|Eraser|UndoRedo|null|EraseRedo = null; // 目前正在绘制的图形
    redoList:(baseGraph|EraseRedo|UndoRedo)[] = []; // 撤销堆栈
    

    tableformat: TableFormat; // 表格配置

    panStyle: PanStyle; // 笔基础配置

    autolineSetting: AutolineSetting; // 智能笔设置

    
    
    data: Data
    iconNum: IconNum;
    DiyNumberRect: DiyNumberRect;
    openTextInput: Function; // 打开输入框的
    openNumberSelect: Function; // 打开数字选择框的
    controlEvent: ControlEvent; // 管理控制事件
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

        this.iconNum = new IconNum(this.tableCanvasContext.topicon_canvas, this, data)
        this.DiyNumberRect = new DiyNumberRect(this.tableCanvasContext.diyNumber_canvas, this, data)

        this.openNumberSelect = openNumberSelect

        this.controlEvent = new ControlEvent(this)
    }
    // 将被封存在graphs中的重新拿到nowDraw中
    upToNowDraw(graph: baseGraph){
        const index = this.graphs.indexOf(graph)
        if (index>=0) {
            this.graphs.splice(index, 1)
            this.setNowGraph(graph)
            this.overdrawForBg()
        }
    }

    // 输入文本
    isTextInputMode = false
    textInput(value: string){
        value = value.trim()
        if (value === '') {
            return
        }
        this.cleaDraw()
        this.overdrawForBg()
        this.setNowGraph(new Text(this.panStyle, this.lastTouchPosition, this))
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
    isControlMode = false;
    touchId: Symbol = Symbol("touchId");
    touchEvent(touche: TouchEvent) {
        const tableCanvasContext = this.tableCanvasContext;
        const panStyle = this.panStyle
        
        const position = new Position(touche.x || 0, touche.y || 0, PositionType.real)
        
        switch (touche.type) {
            case 'touchstart':
                if(!touche) break;
                if(touche.x && touche.x <= this.tableformat.dateInfo.width) break;
                this.touchStartPosition = position
                this.lastTouchPosition = position
                this.isControlMode = false;
                this.touchId = Symbol("touchId")
            case 'touchmove':
                if(!touche) break;
                if(touche.x && touche.x <= this.tableformat.dateInfo.width) break;
                
                if (this.isTouching) {
                    this.lastTouchPosition = position
                    if (this.isControlMode && this.touchStartPosition && this.controlEvent.touchmove(this.touchId, this.touchStartPosition, position)){
                        // 被控制类接手 交由控制类处理
                    }else if (this.drawNowGraph instanceof UndoRedo) {
                        // 这个类是用来管理特殊操作的撤回的
                    }else{
                        if (this.drawNowGraph instanceof baseGraph || this.drawNowGraph instanceof Eraser) {
                            this.drawNowGraph?.moveTo(position, 'touchmove')   
                        }
                    }
                }else{
                    if (this.touchStartPosition && tools.distanceBetweenPoints(this.touchStartPosition,position)>5) {
                        // 进入到这里代表本次触摸被视为拖动，这里会被排除掉一些抖动的误操作
                        // 而这里是开始算开始事件
                        this.isTouching = true
                        
                        if(this.controlEvent.touchmove(this.touchId, this.touchStartPosition, position)){
                            // 被控制类接手 交由控制类处理
                            console.log("接管")
                            this.isControlMode = true;
                        }else if (panStyle.type === 'eraser'){
                            this.setNowGraph(new Eraser(this, position)); // 橡皮擦
                        }else if (panStyle.type === 'autoLine') {
                            this.cleaDraw()
                            this.overdrawForBg()
                            // 智能线特殊处理
                            const graph = new AutoLines(panStyle, position, this.autolineSetting, this.data, this.iconNum, this.controlEvent, this)
                            this.setNowGraph(graph)
                            this.drawTopCTX()
                        }else{
                            // 其他图形
                            const graph = graphClass[panStyle.type]
                            if (graph) {
                                this.cleaDraw()
                                this.overdrawForBg()
                                this.setNowGraph(new graph(panStyle, position))
                            }
                        }
                    }
                }
                
                break;
            case "touchend":
                this.isTouching = false
                if ((this.touchStartPosition && this.lastTouchPosition && tools.distanceBetweenPoints(this.touchStartPosition,this.lastTouchPosition)<5) && !(['eraser'].includes(this.panStyle.type))) {
                    // 视为点击事件
                    if (this.controlEvent.tap(this.touchStartPosition, this.lastTouchPosition)) {
                        // 被控制类接手 交由控制类处理
                    }else if (this.panStyle.type == 'text') {
                        this.openTextInput()
                    }else{
                        // 这里判断是否为可填写行
                        const data = this.data;
                        const m = this.lastTouchPosition.getMatrixPosition()
                        if (data[m.y]?.isWrite === true){
                            // 判断为可写入时，调起页面填写                            
                            this.DiyNumberRect.tap(m)
                        }else{
                            this.iconNum.tap(this.lastTouchPosition,this.panStyle)
                            this.drawTopCTX()
                        }
                    }
                }else{
                    console.log("触发操作，滑动结束")
                    // 滑动结束
                    if (this.controlEvent.moveEnd(this.touchId)) {
                        
                    }else if (this.drawNowGraph instanceof baseGraph) {
                        const graph = this.drawNowGraph
                        this.drawNowGraph.moveEnd()
                        if (graph instanceof AutoLines) {
                            this.overdrawForBg()
                        }
                        this.setNowGraph(null)
                        this.overdrawForBg()
                    }
                    
                    if (this.drawNowGraph instanceof Eraser) {
                        this.drawNowGraph = null
                        this.tableCanvasContext.control_canvas.draw()
                    }
                }
                this.touchId = Symbol("touchId")
                this.lastTouchPosition = null
                break;
            case "touchcancel":
                // 滑动被打断
                // 使其为结束处理
                this.touchEvent({type: 'touchend',x:undefined,y:undefined});
                break;
        }
        this.draw()
    }
    setNowGraph(graph: baseGraph | null | UndoRedo | Eraser | EraseRedo) {
        if (this.drawNowGraph) {
            if (this.drawNowGraph instanceof Eraser) {
                
            }else{
                this.graphs.push(this.drawNowGraph)
                this.overdrawForBg()
            }
        }
        this.drawNowGraph = graph
    }

    // 将绘制中的图形固定到graphs
    cleaDraw(){
        // 判断是否有绘制中的图像
        this.setNowGraph(null)
    }

    // 完全重新绘制一次背景,并将绘制中的图像也绘制上去
    // 该操作消耗性能，不要过多调用
    overdrawForBg(drawBefore?:Function){
        console.log("绘制底层");
        const bgCTX = this.tableCanvasContext.bg_canvas

        this.bg.draw(bgCTX)
        this.graphs.forEach(graph => {
            if (graph instanceof UndoRedo || graph instanceof EraseRedo) {
                return;
            }
            graph.draw(bgCTX)
        })
        if (drawBefore) {
            drawBefore(bgCTX)
        }
        bgCTX.draw()
    }
    // 撤销上一步操作
    undo():void {
        if(this.drawNowGraph){
            if (this.drawNowGraph instanceof Eraser) {
                this.drawNowGraph = null
                return this.undo()
            }
            if (this.drawNowGraph instanceof EraseRedo) {
                this.drawNowGraph.redo()
                const index = this.redoList.indexOf(this.drawNowGraph)
                this.redoList.splice(index,1)
            }else{
                console.log("recycle")
                this.drawNowGraph.recycle()
            }            
            this.redoList.push(this.drawNowGraph)
            this.drawNowGraph = null
            this.draw()
            this.overdrawForBg()
            this.drawTopCTX()
        }else if(this.graphs.length){
            const lastGraph = this.graphs.pop()
            if (lastGraph) {
                this.setNowGraph(lastGraph)
            }
            this.undo()
            // 每次操作图形数组后都要重新绘制一次背景
            // this.overdrawForBg()
            // this.drawTopCTX()
            // this.draw()
        }
        
    }
    
    // 恢复已撤销的操作
    redo(){
        if(this.redoList.length){
            const lastGraph = this.redoList.pop()
            if (lastGraph) {
                if (lastGraph instanceof UndoRedo) {
                    lastGraph.redo()
                }
                if (lastGraph instanceof EraseRedo) {
                    lastGraph.redo()
                    const index = this.graphs.indexOf(lastGraph)
                    this.graphs.splice(index,1)
                }else{
                    this.setNowGraph(lastGraph)
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
        this.drawNowGraph = null
        if (this.graphs.length) {
            // this.redoList.push(...this.graphs)
            this.graphs = []
        }
        // 每次操作图形数组后都要重新绘制一次背景
        this.iconNum.clear()
        this.DiyNumberRect.clear()
        this.overdrawForBg()
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
            success: (result) => {
                console.log('保存成功，文件路径：', result.savedFilePath);
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
                uni.hideLoading()
                this.overdrawForBg()
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

    static async asyncUniCanvasToTemp(canvasId: string):Promise<string>{
        return new Promise((resolve, reject) => {
            uni.canvasToTempFilePath({
                canvasId: canvasId, // 替换为实际的canvas ID
                success: (res) => {
                    resolve(res.tempFilePath)
                },
                fail: (err) => {
                    console.error('转换临时文件失败：', err);
                    reject()
                }
            });
        })
    }
    // outBase64
    async outBase64():Promise<string>{

        // 将目前绘制中的固定到gr列表
        this.cleaDraw()
        
        // 将顶部图层绘制到底部然后导出
        this.overdrawForBg((ctx: UniApp.CanvasContext)=>{
            this.iconNum.draw(ctx, false)
            this.DiyNumberRect.draw(ctx, false)
        })
        return Table.asyncUniCanvasToTemp(this.canvasId.bg_canvas)
    }

    numberSelect(res: numberSelectData){
        this.DiyNumberRect.handleConfirm(res)
    }

    // 重新绘制顶层
    drawTopCTX(){
        // 这里需要把顶层重新绘制一次
        this.iconNum.draw()
    }

    draw() {
        // if (this.drawNowGraph instanceof AutoLine) {
        //     this.drawNowGraph.drawControl(this.tableCanvasContext.control_canvas)
        //     this.tableCanvasContext.control_canvas.draw()
        // }

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
function base64ToBlob(base64Data: string) {
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

