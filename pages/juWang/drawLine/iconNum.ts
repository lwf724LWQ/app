import { Position, PositionType, Data, TableFormat, lineData, TableCanvasContext, style, PanStyle, tableStyle, AutolineSetting, getTableNumberStyle } from "./table";
import { EraserRes } from "./graphs/baseGraph";
import tools from "./tools"

interface styleObj {panStyle: PanStyle, numStyle:style}
interface EraserResForIcon extends EraserRes {
    data?: {
        itemObj: styleObj,
        position_matrix: Position
    }
}
export default class IconNum {
    ctx: UniApp.CanvasContext;
    data:Data;
    iconList: (styleObj|null)[][]=[]
    constructor(ctx: UniApp.CanvasContext, data:Data){
        this.ctx = ctx;
        this.data = data
    }

    tap(position: Position, PanStyle: PanStyle){
        this.addIcon(position, PanStyle)
    }

    addIcon(position: Position, PanStyle: PanStyle, isOverlap = false){
        const matrix = position.getMatrixPosition()
        const iconList = this.iconList
        if (iconList[matrix.y] && iconList[matrix.y][matrix.x] && !isOverlap) {
            iconList[matrix.y][matrix.x] = null
        }else{
            if (!(iconList[matrix.y] instanceof Array)) {
                iconList[matrix.y] = []
            }
            iconList[matrix.y][matrix.x] = {
                panStyle: PanStyle,
                numStyle: getTableNumberStyle()[matrix.x]
            }
        }
    }

    eraserRes: EraserResForIcon = {isEraser: false};
    eraser(position: Position):EraserResForIcon {
        const real = position.getRealPosition()
        const m = position.getMatrixPosition()
        const iconList = this.iconList
        const lineData = this.data[m.y]
        if (iconList[m.y] && iconList[m.y][m.x] && real) {
            const itemObj = Object.assign({}, iconList[m.y][m.x])
            // 判断一下有没有在这个圆中
            if (tools.distanceBetweenPoints(new Position(m, PositionType.matrix), position) <= itemObj.numStyle.width/2) {
                iconList[m.y][m.x] = null
                if (lineData.isWrite) {
                    lineData.number[m.x] = ''
                }
                return {
                    isEraser: true,
                    data: {itemObj, position_matrix: new Position(m.x, m.y, PositionType.matrix)}
                }
            }
        }
        return this.eraserRes
    }
    undo(eraserRes: EraserResForIcon){
        if (eraserRes.data) {
            this.addIcon(eraserRes.data.position_matrix, eraserRes.data.itemObj.panStyle)
        }
        this.eraserRes = {isEraser: false}
    }

    // 画圆
    drawCircle(position: Position, styleObj: styleObj) {
        const {panStyle, numStyle} = styleObj
        const ctx = this.ctx
        const matrix = position.getMatrixPosition()
        const real = position.getRealPosition()
        const number = this.data[matrix.y]?.number[matrix.x] || ''
        if(!real){
            return 0
        }
        const lineWidth = uni.upx2px(8)

        // 获取这格的大小,并取短边作为直径
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

    draw(){
        const iconList = this.iconList
        for (let y = 0; y < iconList.length; y++) {
            if (iconList[y] instanceof Array) {
                for (let x = 0; x < iconList[y].length; x++) {
                    const item = iconList[y][x];
                    if (item) {
                        this.drawCircle(new Position(x, y, PositionType.matrix), item)
                    }
                }
            }
        }
    }
}