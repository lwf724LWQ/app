import baseGraph from "./baseGraph"

import Table, { Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle } from "../table";
import { EraserRes } from "./baseGraph";
import tools from "../tools"
import ControlEvent, {ClickGraph} from "../controlEvent";


/**
 * 
 */


// 文本
export default class Text extends baseGraph {
    end: Position;
    isEnd: boolean = false;
    isFill: boolean = false;
    
    table: Table;
    controlEvent: ControlEvent;

    static Texts: Text[] = []
    constructor(panStyle:PanStyle, start: Position, table: Table) { 
        super(panStyle, start);
        this.start = start;
        this.end = this.start;
        this.table = table;
        this.controlEvent = table.controlEvent;

        Text.Texts.forEach(item => (item.removeAllEvent(),item.setEditMode(false)))
        Text.Texts.push(this)
    }
    // 添加拖动整个框的监听
    moveTextBoxEventId: string | null = null;
    textBoxClickGraph: ClickGraph = new ClickGraph("Rect", this.start, this.end);
    addTextBoxTouchMove(){
        if (this.moveTextBoxEventId) {
            this.controlEvent.recycle(this.moveTextBoxEventId)
        }
        this.moveTextBoxEventId = this.controlEvent.registerEvent("touchmove", {
            clickGraph: this.textBoxClickGraph,
            moveStart: (start) =>{
                this.moveTo(start, 'touchstart')
                this.table.upToNowDraw(this)
            },
            callBack: (start, now) => {
                this.moveTo(now, "touchmove")
            },
            moveend: () => {
                this.moveTo(null, "touchend")
                this.addTapFullScreenTouchEvent()
            }
        })
    }

    // 添加一个针对文本点击事件
    tapTextBoxEventId: string | null = null;
    addTapTextBoxEvent(){
        if (this.tapTextBoxEventId) {
            this.controlEvent.recycle(this.tapTextBoxEventId)
        }
        this.tapTextBoxEventId = this.controlEvent.registerEvent("click", {
            clickGraph: this.textBoxClickGraph,
            callBack: () => {
                console.log("点击文本")
                this.setEditMode(true)
                if (this.tapTextBoxEventId) {
                    this.controlEvent.recycle(this.tapTextBoxEventId)
                }
            }
        })
    }
    isEdit = false
    setEditMode(mode: boolean){
        this.isEdit = mode
        if (mode) {
            this.addBtnsEvent()            
        }else{
            this.removeBtnsEvent()
        }
    }
    // 添加编辑按钮的监听
    editTextBtnEventId: string | null = null;
    editTextBtnClickGraph: ClickGraph = new ClickGraph("Circle", new Position(0,0,PositionType.real), 0);
    changeFillModeBtnEventId: string | null = null;
    changeFillModeBtnClickGraph: ClickGraph = new ClickGraph("Circle", new Position(0,0,PositionType.real), 0);
    changeSizeBtnEventId: string | null = null;
    changeSizeBtnClickGraph: ClickGraph = new ClickGraph("Circle", new Position(0,0,PositionType.real), 0);
    // 文本大小系数 
    // 该值代表1宽=多少字体大小
    textCoefficient = 0;
    addBtnsEvent(){ 
        this.removeBtnsEvent()
        this.editTextBtnEventId = this.controlEvent.registerEvent("click", {
            clickGraph: this.editTextBtnClickGraph,
            callBack: () => {
                // 这里掉起外部编辑面板
                console.log("编辑文本面板")
                this.table.upToNowDraw(this)
                this.table.openTextInput(this.textValue, (value)=>{
                    this.confirm(value)
                    this.table.draw()
                    this.table.draw()
                })
            }
        })
        this.changeFillModeBtnEventId = this.controlEvent.registerEvent("click", {
            clickGraph: this.changeFillModeBtnClickGraph,
            callBack: () => {
                // 切换是否填充
                console.log("切换是否填充")
                this.table.upToNowDraw(this)
                this.isFill = !this.isFill
            }
        })
        this.changeSizeBtnEventId = this.controlEvent.registerEvent("touchmove", {
            clickGraph: this.changeSizeBtnClickGraph,
            moveStart: (start) =>{
                console.log("改变文本大小开始")
                this.table.upToNowDraw(this)
            },
            callBack: (start, now) => {
                // 改变大小
                const {a1, a2} = this.getRectPoint()
                this.textWidth = Math.max(now.x - a1.x, this.table.width * 0.08)
            },
            moveend: () => {
                console.log("改变文本大小结束")
            }
        })
    }
    removeBtnsEvent(){
        this.controlEvent.recycle(this.editTextBtnEventId)
        this.controlEvent.recycle(this.changeFillModeBtnEventId)
        this.controlEvent.recycle(this.changeSizeBtnEventId)
    }


    // 添加一个用于拦截点击其他地方的触摸事件，来取消编辑模式
    tapFullScreenTouchEventId: string | null = null;
    moveFullScreenTouchEventId: string | null = null;
    addTapFullScreenTouchEvent(){
        if (this.tapFullScreenTouchEventId) {
            this.controlEvent.recycle(this.tapFullScreenTouchEventId)
        }
        this.tapFullScreenTouchEventId = this.controlEvent.registerEvent("click", {
            clickGraph: new ClickGraph("Rect", new Position(0,0,PositionType.real), new Position(this.table.width, this.table.height, PositionType.real)),
            callBack: (position) => {
                // 判断有没有点到文字上面
                if (this.textBoxClickGraph?.isInGraph(position)) {
                    console.log("从全屏拦截进来的 点击文本")
                    this.setEditMode(true)
                    return
                }else{
                    console.log("从全屏拦截进来的 点击其他地方")
                    this.setEditMode(false)
                }
                if (this.tapFullScreenTouchEventId) {
                    this.controlEvent.recycle(this.tapFullScreenTouchEventId)
                }
                if (this.moveFullScreenTouchEventId) {
                    this.controlEvent.recycle(this.moveFullScreenTouchEventId)
                }
            },
        })

        // if (this.moveFullScreenTouchEventId) {
        //     this.controlEvent.recycle(this.moveFullScreenTouchEventId)
        // }
        // this.moveFullScreenTouchEventId = this.controlEvent.registerEvent("touchmove", {
        //     clickGraph: new ClickGraph("Rect", new Position(0,0,PositionType.real), new Position(this.table.width, this.table.height, PositionType.real)),
        //     moveStart: (start) =>{
        //         console.log("从全屏拦截进来的 移动其他地方")
        //         if (this.moveFullScreenTouchEventId) {
        //             this.controlEvent.recycle(this.moveFullScreenTouchEventId)
        //         }
        //         if (this.tapFullScreenTouchEventId) {
        //             this.controlEvent.recycle(this.tapFullScreenTouchEventId)
        //         }
        //     },
        //     callBack: (start, now) => {
        //     }
        // })
        
    }

    removeAllEvent(){
        this.controlEvent.recycle(this.moveTextBoxEventId)
        this.controlEvent.recycle(this.tapTextBoxEventId)
        this.controlEvent.recycle(this.editTextBtnEventId)
        this.controlEvent.recycle(this.changeFillModeBtnEventId)
        this.controlEvent.recycle(this.changeSizeBtnEventId)
        this.controlEvent.recycle(this.tapFullScreenTouchEventId)
        this.controlEvent.recycle(this.moveFullScreenTouchEventId)
    }

    textValue: string = ''
    confirm(value: string){
        this.textValue = value
        this.isFirstDrawText = true
        this.textCoefficient = 0
        this.textWidth = 0

        this.addTextBoxTouchMove()
        this.addTapTextBoxEvent()
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
    
    moveTo(position:Position, type: 'touchstart'|'touchmove');
    moveTo(position:null, type: 'touchend');
    moveTo(position: Position | null, type: 'touchstart'|'touchmove'|'touchend'): void {
        if (type === 'touchstart') {
            const realNow = this.end.getRealPosition()
            const realNew = position.getRealPosition()
            if (!realNow || !realNew) {
                return
            }
            this.touchVerPosition = new Position(realNew.x - realNow.x, realNew.y - realNow.y, PositionType.real)
            this.setEditMode(true)
            return
        }else if (type === 'touchmove') { 
            const real = position.getRealPosition()
            if (!real || !this.touchVerPosition) {
                return
            }
            

            const x = real.x - this.touchVerPosition.x
            const y = real.y - this.touchVerPosition.y 

            
            
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

        const notOverLeft = this.table.tableformat.dateInfo.width // 不要超出这个x
            // 这里做一个限位
            // end是矩形中心点， 这里的xy是移动后的中心点
        const x = Math.max(end.x,notOverLeft + (this.textWidth/2))
        return {
            a1: new Position(x - w, end.y - w, PositionType.real),
            a2: new Position(x + w, end.y + w, PositionType.real)
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
        ctx.fill()
        
    }
    // 绘制编辑时的外框
    drawEditorRect(ctx: UniApp.CanvasContext){
        if(!this.isEdit){return}
        const {a1, a2} = this.getRectPoint()
        // 要比本体大一点
        const moreSize = uni.upx2px(20)
        // 绘制外框
        ctx.beginPath()
        ctx.setLineWidth(this.panStyle.size)
        ctx.setStrokeStyle(this.panStyle.color)
        // 计算出矩形的宽高
        a1.x = a1.x - moreSize
        a1.y = a1.y - moreSize
        a2.x = a2.x + moreSize
        a2.y = a2.y + moreSize
        const WH = tools.getRectangleDimensions(a1, a2)
        ctx.rect(a1.x,a1.y, WH.width, WH.height)
        ctx.stroke()
    }

    // 编辑时的按钮
    drawEditorButton(ctx: UniApp.CanvasContext){ 
        if (!this.isEdit) {return}
        const panStyle = this.panStyle;
        const fontSize = this.table.width * 0.05
        const r = this.table.width * 0.05
        function draw(position: Position, text: string){
            ctx.beginPath()
            ctx.arc(position.x, position.y, r, 0, 2 * Math.PI)
            ctx.setFillStyle(panStyle.color)
            ctx.fill()
            ctx.beginPath()
            ctx.setFontSize(fontSize)
            ctx.setTextBaseline('middle')
            ctx.setTextAlign('center')
            ctx.setFillStyle("#fff")
            ctx.fillText(text, position.x, position.y)
        }
        // 要比本体大一点
        const moreSize = uni.upx2px(20)
        const {a1, a2} = this.getRectPoint()
        // 计算出矩形的宽高
        a1.x = a1.x - moreSize
        a1.y = a1.y - moreSize
        a2.x = a2.x + moreSize
        a2.y = a2.y + moreSize
        // 顶部按钮
        
        const topArcPosition = new Position(a1.x + (this.textWidth / 2) + (moreSize), a1.y, PositionType.real)
        draw(topArcPosition, '编辑')
        this.editTextBtnClickGraph.setNewPosition(topArcPosition, r)

        const leftBottomArcPosition = new Position(a1.x, a2.y, PositionType.real)
        draw(leftBottomArcPosition, this.isFill ? '空心' : '实心')
        this.changeFillModeBtnClickGraph.setNewPosition(leftBottomArcPosition, r)

        const rightBottomArcPosition = new Position(a2.x, a2.y, PositionType.real)
        draw(rightBottomArcPosition, '大小')
        this.changeSizeBtnClickGraph.setNewPosition(rightBottomArcPosition, r)
    }
    getFontSize():number {
        // 第一次需要依赖默认文本大小去计算宽度和文本大小系数
        if (this.isFirstDrawText && this.textCoefficient == 0) {
            console.log(this.panStyle.size * uni.upx2px(30))
            return this.panStyle.size * uni.upx2px(30)
        }else{
            return this.textWidth * this.textCoefficient
        }
    }
    // 绘制文本
    textWidth: number = 0;
    isFirstDrawText: Boolean = true;
    drawText(ctx: UniApp.CanvasContext) { 
        const end = this.end.getRealPosition()
        if (end && this.textValue.length) {
            // 绘制文本
            ctx.beginPath()
            ctx.setFontSize(this.getFontSize())
            if (this.isFill) {
                ctx.setFillStyle("#ffffff")
            }else{
                ctx.setFillStyle(this.panStyle.color)
            }
            ctx.setTextBaseline('middle')
            ctx.setTextAlign('center')

            const notOverLeft = this.table.tableformat.dateInfo.width // 不要超出这个x
            // 这里做一个限位
            // end是矩形中心点， 这里的xy是移动后的中心点
            const x = Math.max(end.x,notOverLeft + (this.textWidth/2))
            ctx.fillText(this.textValue, x, end.y)
            this.textWidth = ctx.measureText(this.textValue).width

            if (this.isFirstDrawText) {
                // 如果是第一次绘制这个文本，需要计算出系数，提供给后续拖动变换大小使用
                // 这里计算出1宽等于多少文本大小
                this.textCoefficient = this.getFontSize() / this.textWidth
                this.isFirstDrawText = false
            }
        }
    }

    draw(ctx: UniApp.CanvasContext) {
        if (this.eraserRes.isEraser) {
            return
        }
        const {a1, a2} = this.getRectPoint()
        this.textBoxClickGraph?.setNewPosition(a1, a2)
        this.drawEditorRect(ctx)
        this.drawEditorButton(ctx)
        
        if (this.isFill) {
            this.drawRect(ctx)
        }
        this.drawText(ctx)
    }
}
