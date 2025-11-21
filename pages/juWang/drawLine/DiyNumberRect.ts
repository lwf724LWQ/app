import baseGraph from "./graphs/baseGraph"

import Table,{ tableStyle, Position, PositionType, TableFormat, lineData, TableCanvasContext, style,PanStyle, getTableNumberStyle, Data, numberSelectData,numberType } from "./table";

import { EraserRes } from "./graphs/baseGraph";
import tools from "./tools"
import Rect from "./graphs/Rect";


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
    undo(){
        this.rectList.forEach(item => item.undo())
    }

    handleConfirm(numberSelectData: numberSelectData){
        console.log("接受到数字选择器返回", numberSelectData)
        // const lineData = this.data[numberSelectData.XY.y]
        
        
        if (numberSelectData.type === 'advanced') {
            const numberType = numberSelectData.data.type
            if (numberType === '稳码') {
                
            }else if (['单', '双', '大', '小', 'X', '杀',''].includes(numberType)) {
                this.addRect(numberSelectData.XY, numberSelectData)
            }else if (numberType === '中肚合') {
                this.addRect(Object.assign({}, numberSelectData.XY, {x: 2}), numberSelectData)
                this.addRect(Object.assign({}, numberSelectData.XY, {x: 3}), numberSelectData)
            }else if (numberType === '千百合') {
                this.addRect(Object.assign({}, numberSelectData.XY, {x: 1}), numberSelectData)
                this.addRect(Object.assign({}, numberSelectData.XY, {x: 2}), numberSelectData)
            }else if (numberType === '百个合') {
                this.addRect(Object.assign({}, numberSelectData.XY, {x: 2}), numberSelectData)
                this.addRect(Object.assign({}, numberSelectData.XY, {x: 4}), numberSelectData)
            }
            this.draw()
        }else{
            this.table.data[numberSelectData.XY.y].number[numberSelectData.XY.x] = numberSelectData.data.string
            this.table.iconNum.addIcon(new Position(numberSelectData.XY, PositionType.matrix), this.table.panStyle, true)
            this.table.drawTopCTX()
        }
    }

    addRect(XY,numberSelectData: numberSelectData){
        const numStyle = getTableNumberStyle()[XY.x]
        const halfWidth = numStyle.width / 2
        const halfHeigth = this.table.tableformat.lineHeight / 2

        const position = new Position(XY, PositionType.matrix)
        const realPosition = position.getRealPosition()
        const panStyle = this.table.panStyle
        const ltPoint = new Position(realPosition.x - halfWidth, realPosition.y - halfHeigth, PositionType.real)
        const rbPoint = new Position(realPosition.x + halfWidth, realPosition.y + halfHeigth, PositionType.real)
        this.rectList.push(new MyRect(panStyle, ltPoint, rbPoint, position, numberSelectData.data))
    }

    draw(){
        this.rectList.forEach(item => item.draw(this.ctx))
        this.ctx.draw()
    }
}




class MyRect extends Rect {
    data:{type: numberType, numbers: string[]};
    center: Position;
    constructor(panStyle:PanStyle, start: Position,end: Position, center: Position,data:{type: numberType, numbers: string[]}, isFill: boolean = true) { 
        super(panStyle, start, isFill)
        this.end = end
        this.center = center
        this.data = data
    }
    eraser(position: Position): EraserRes {
        const res = super.eraser(position);
        return res
    }
    undo(): void {
        super.undo();
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
        const data = this.data;
        super.draw(ctx, 1);
        
        let y = this.start.y

        if (data.numbers.length <= 3) {
            y+= (this.getFontSize() / 2)
        }
        if (["X",""].includes(data.type)) {
            y+= (this.getFontSize() / 2)
        }

        ctx.beginPath()
        ctx.setFontSize(this.getFontSize())
        ctx.setTextBaseline('top')
        ctx.setTextAlign('center')

        if (this.isFill) {
            ctx.setFillStyle("#fff")    
        }else{
            ctx.setFillStyle(this.panStyle.color)
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