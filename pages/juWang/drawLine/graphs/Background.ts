import baseGraph from "./baseGraph";
import { Position, PositionType, Data, TableFormat, lineData, TableCanvasContext, style, PanStyle, getTableNumberStyle } from "../table";
import moment from "moment";

/**
 * 背景
 * 传入宽高，以每行6格画一个表格
 */
export default class Background extends baseGraph {
    tableformat: TableFormat;
    data: Data;
    constructor(panStyle:PanStyle, tableformat: TableFormat, data:Data) { 
        super(panStyle, new Position(0,0, PositionType.real))
        this.tableformat = tableformat
        this.data = data
    }

    // 导出
    export(tableCanvasContext: TableCanvasContext) { 
        // 将其他两个画布的内容搬到这个上面并且导出
    }

    getDayOfWeek(date: Date = new Date()): string {
        const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
        return daysOfWeek[date.getDay()];
    }

    drawDateInfo(ctx: UniApp.CanvasContext, style: style, y: number, data: lineData|undefined) {
        const lineHeight = this.tableformat.lineHeight
        ctx.setFillStyle(style.bgColor)
        ctx.fillRect(style.left, lineHeight*y,style.width, lineHeight)

        if (data) {
            const w = this.tableformat.width

            ctx.setFontSize(style.textSize)
            ctx.setFillStyle(style.textColor)
            ctx.setTextAlign('center')
            ctx.setTextBaseline('middle')
            ctx.fillText(data.issueno, style.width/2, lineHeight*y + (w*0.04))

            if (data?.opendate) {
                ctx.setFontSize(uni.upx2px(24))
                const dayString = `${moment(data?.opendate).format("MM-DD")} ${this.getDayOfWeek()}`
                ctx.fillText(dayString, style.width/2, lineHeight*y + (w*0.08))
            }
        }
    }

    drawNumber(ctx: UniApp.CanvasContext, style: style, y: number, dataNumber: string|number) { 
        const lineHeight = this.tableformat.lineHeight
        const halfHeight = lineHeight / 2;
        const halfWidth = style.width / 2;
        ctx.setFillStyle(style.bgColor)
        ctx.fillRect(style.left, lineHeight*y,style.width, lineHeight)
        ctx.setFontSize(style.textSize)
        ctx.setFillStyle(style.textColor)
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')
        ctx.fillText(dataNumber.toString(), style.left + halfWidth, (lineHeight*y) + halfHeight)
    }

    draw(ctx: UniApp.CanvasContext) {
        const tableformat = this.tableformat;
        const data = this.data;
        
        (new Array(20)).fill(1).map((_,i) => {
            // 画格子
            this.drawDateInfo(ctx, tableformat.dateInfo, i, data[i])
            this.drawNumber(ctx, tableformat.number1, i, data[i]?.number[0] || '')
            this.drawNumber(ctx, tableformat.number2, i, data[i]?.number[1] || '')
            this.drawNumber(ctx, tableformat.number3, i, data[i]?.number[2] || '')
            this.drawNumber(ctx, tableformat.number4, i, data[i]?.number[3] || '')
            this.drawNumber(ctx, tableformat.number5, i, data[i]?.number[4] || '')
            this.drawNumber(ctx, tableformat.number6, i, data[i]?.number[5] || '')
            
            const borderColor = "#77a067";
            ctx.beginPath()
            ctx.setStrokeStyle(borderColor)
            ctx.setLineWidth(3)
            ctx.moveTo(0,(i+1) * tableformat.lineHeight)
            ctx.lineTo(tableformat.width, (i+1) * tableformat.lineHeight)
            ctx.stroke()
        });
        [tableformat.dateInfo,...getTableNumberStyle()]
            .map(style => {
                const borderColor = "#77a067";
                ctx.beginPath()
                ctx.setStrokeStyle(borderColor)
                ctx.setLineWidth(3)
                ctx.moveTo(style.left,0)
                ctx.lineTo(style.left,tableformat.height)
                ctx.stroke()
            })
    }

}