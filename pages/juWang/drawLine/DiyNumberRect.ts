import baseGraph from "./graphs/baseGraph"

import Table,{ tableStyle, Position, PositionType, TableFormat, lineData, TableCanvasContext,AdvancedNumberSelectData, style,PanStyle, getTableNumberStyle, Data, numberSelectData,numberType } from "./table";

import { EraserRes } from "./graphs/baseGraph";
import tools from "./tools"
import Rect from "./graphs/Rect";
import { UndoRedo } from "./tools";
import Eraser from "./eraser";


// 提供给撤销恢复的，DiyNumberRect类里的undo方法是给擦除那边调的 两者不同
class MyUndoRedo extends UndoRedo { 
    diyNumberRect: DiyNumberRect;
    numberSelectData:numberSelectData;
    rectList: MyRect[];
    oldRectList: MyRect[];
    constructor(diyNumberRect: DiyNumberRect, numberSelectData: numberSelectData, rectList: MyRect[], oldRectList: MyRect[]){
        super()
        this.diyNumberRect = diyNumberRect;
        this.numberSelectData = numberSelectData;
        this.rectList = [...rectList];
        this.oldRectList = [...oldRectList]
    }

    recycle(){
        this.diyNumberRect.rectList = [...this.oldRectList]
        this.diyNumberRect.draw()
    }
    redo(){
        this.diyNumberRect.rectList = [...this.rectList]
        this.diyNumberRect.draw()
    }
}
interface EraserResForDirNumber extends EraserRes{
    data?: EraserRes[];
}
export default class DiyNumberRect {
    ctx: UniApp.CanvasContext;
    data:Data;
    table: Table

    rectList: MyRect[] = [];
    constructor(ctx: UniApp.CanvasContext, table: Table,data:Data){
        this.ctx = ctx;
        this.data = data;
        this.table = table;

    }
    
    eraserRes:EraserResForDirNumber = {isEraser: false}
    eraser(position: Position): EraserResForDirNumber{
        const data = this.rectList.map(item => item.eraser(position))
        return {
            isEraser: data.some(item => item.isEraser),
            data
        }
    }
    // 给擦除用的撤回
    undo(resetData: EraserResForDirNumber){
        resetData.data?.forEach((eraserRes, index)=>{
            if (eraserRes.isEraser == false) {
                this.rectList[index].undo()
            }
        })

        this.draw()
    }
    // 清除
    clear(){
        this.rectList = []
        this.draw()
    }
    
    tap(XY: {x: number, y: number}){
        // 查找一下有没有已经画进去的
        const isEraser = Eraser.eraserNormalGraph(new Position(XY, PositionType.matrix), this.rectList, this.table)
        if (isEraser) {
            this.draw()
            return
        }
        const placeValue = ["小","千","百","十","个","末"][XY.x]
        this.table.openNumberSelect(placeValue, XY)
    }

    handleConfirm(numberSelectData: numberSelectData){
        console.log("接受到数字选择器返回", numberSelectData)
        // const lineData = this.data[numberSelectData.XY.y]
        
        if (numberSelectData.type === 'advanced') {
            const numberType = numberSelectData.data.type;
            const oldRectList = [...this.rectList]
            if (numberType === '稳码') {
                this.rectList = []
                this.wenmaRect(numberSelectData.XY, numberSelectData)
            }else if (['单', '双', '大', '小', 'X', '杀',''].includes(numberType)) {
                this.normalRect(numberSelectData.XY, numberSelectData)
            }else if (numberType === '中肚合') {
                this.rectList = []
                this.normalRect(Object.assign({}, numberSelectData.XY, {x: 2}), numberSelectData)
                this.normalRect(Object.assign({}, numberSelectData.XY, {x: 3}), numberSelectData)
            }else if (numberType === '千百合') {
                this.rectList = []
                this.normalRect(Object.assign({}, numberSelectData.XY, {x: 1}), numberSelectData)
                this.normalRect(Object.assign({}, numberSelectData.XY, {x: 2}), numberSelectData)
            }else if (numberType === '百个合') {
                this.rectList = []
                this.normalRect(Object.assign({}, numberSelectData.XY, {x: 2}), numberSelectData)
                this.normalRect(Object.assign({}, numberSelectData.XY, {x: 4}), numberSelectData)
            }
            this.draw()
            // 初始化擦除
            this.eraserRes = this.eraser(new Position(-99999, -99999, PositionType.real))
            this.table.setNowGraph(new MyUndoRedo(this, numberSelectData, this.rectList, oldRectList))
        }else{
            // this.table.data[numberSelectData.XY.y].number[numberSelectData.XY.x] = numberSelectData.data.string
            this.table.iconNum.addIcon(new Position(numberSelectData.XY, PositionType.matrix), this.table.panStyle, true, numberSelectData.data.string)
            this.table.drawTopCTX()
        }
    }
    
    // 稳码
    wenmaRect(XY,numberSelectData: numberSelectData){
        const leftNumStyle = getTableNumberStyle()[1]
        const rightNumStyle = getTableNumberStyle()[4]
        const width = leftNumStyle.width * 4
        const halfNormalNumWidth = leftNumStyle.width / 2
        const halfHeigth = this.table.tableformat.lineHeight / 2

        const position = new Position(1, XY.y, PositionType.matrix)
        const realPosition = position.getRealPosition()
        if (!realPosition) {
            return
        }

        const center = new Position(realPosition.x - halfNormalNumWidth + (width / 2), realPosition.y, PositionType.real)
        
        const panStyle = this.table.panStyle
        const ltPoint = new Position(realPosition.x - halfNormalNumWidth, realPosition.y - halfHeigth, PositionType.real)
        const rbPoint = new Position(realPosition.x + width- halfNormalNumWidth, realPosition.y + halfHeigth, PositionType.real)
        this.rectList.push(new MyRect(panStyle, ltPoint, rbPoint, center, numberSelectData, this))
    }
    // 普通
    normalRect(XY,numberSelectData: numberSelectData){
        const numStyle = getTableNumberStyle()[XY.x]
        const halfWidth = numStyle.width / 2
        const halfHeigth = this.table.tableformat.lineHeight / 2
        const position = new Position(XY, PositionType.matrix)
        const realPosition = position.getRealPosition()
        if (!realPosition) {
            return
        }
        const panStyle = this.table.panStyle
        const ltPoint = new Position(realPosition.x - halfWidth, realPosition.y - halfHeigth, PositionType.real)
        const rbPoint = new Position(realPosition.x + halfWidth, realPosition.y + halfHeigth, PositionType.real)
        this.rectList.push(new MyRect(panStyle, ltPoint, rbPoint, position, numberSelectData, this))
    }
    

    draw(ctx: UniApp.CanvasContext = this.ctx, isDraw: boolean = true){
        this.rectList.forEach(item => item.draw(ctx))
        isDraw ? ctx.draw() : ""
    }
}




class MyRect extends Rect {
    data:numberSelectData;
    center: Position;
    diyNumber: DiyNumberRect;
    constructor(panStyle:PanStyle, start: Position,end: Position, center: Position,data:numberSelectData,diyNumber: DiyNumberRect , isFill: boolean = true) { 
        super(panStyle, start, isFill)
        this.end = end
        this.center = center
        this.data = data
        this.diyNumber = diyNumber
    }

    undo(): void {
        const oldIsEraser = this.eraserRes.isEraser
        super.undo()
        if (this.eraserRes.isEraser != oldIsEraser) {
            this.diyNumber.draw()
        }
    }
    
    getFontSize(){
        const w = tableStyle.width;
        return w*0.04;
    }

    draw(ctx: UniApp.CanvasContext, alpha?: number): void {
        const realPosition = this.center.getRealPosition()
        if (!realPosition) {
            return
        }
        if (this.eraserRes.isEraser) {
            return
        }
        super.draw(ctx, 1);
        if (this.data.type === 'advanced') {
            let y = this.start.y
            const data = this.data.data
            ctx.beginPath()
            ctx.setFontSize(this.getFontSize())
            ctx.setTextBaseline('top')
            ctx.setTextAlign('center')
            if (this.isFill) {
                ctx.setFillStyle("#fff")    
            }else{
                ctx.setFillStyle(this.panStyle.color)
            }
            if (data.type === '稳码') {
                ctx.setTextBaseline('middle')
                let endReal = this.end.getRealPosition()
                if (!endReal) {
                    endReal = {y: realPosition.y, x: realPosition.x}
                }
                y += ((endReal.y - y) / 2)
                ctx.fillText(`${data.type}${data.numbers.join(" ")}`, realPosition.x, y)
            }else{
                if (data.numbers.length <= 3) {
                    y+= (this.getFontSize() / 2)
                }
                if (["X",""].includes(data.type)) {
                    y+= (this.getFontSize() / 2)
                }
    
                
                if (!["X",""].includes(data.type)) {
                    ctx.fillText(data.type, realPosition.x, y)
                    y += this.getFontSize()
                }
    
                ctx.fillText(data.numbers.slice(0, 3).join(""), realPosition.x, y)
                y += this.getFontSize()
                if (data.numbers.length > 3) {
                    ctx.fillText(data.numbers.slice(3).join(""), realPosition.x, y)
                }
            }
        }
        
    }
}


