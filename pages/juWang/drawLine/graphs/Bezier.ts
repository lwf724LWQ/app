import baseGraph from "./baseGraph";
import Table, { Position, PositionType, TableFormat, lineData, TableCanvasContext, style, PanStyle } from "../table";
import tools from "../tools";
import { EraserRes } from "./baseGraph";
import ControlEvent, { ClickGraph } from "../controlEvent";

// 贝塞尔曲线
export default class Bezier extends baseGraph {
    end: Position;
    control: Position | null = null;
    isEnd: boolean = false;
    defWise: 'left'|'right';

    // 暂存的绘制参数
    path: ({x:number,y:number})[] = [];
    param = {
        left:{
            a1: new Position(0,0,PositionType.real),
            a2: new Position(0,0,PositionType.real),
            c: new Position(0,0,PositionType.real)
        },
        right:{
            a1: new Position(0,0,PositionType.real),
            a2: new Position(0,0,PositionType.real),
            c: new Position(0,0,PositionType.real)
        }
    }
    constructor(panStyle:PanStyle, start: Position, defWise: 'left'|'right' = 'left') { 
        super(panStyle, start)
        const start_matrix = start.getMatrixPosition()
        this.start = new Position(start_matrix.x, start_matrix.y, PositionType.matrix)
        this.end = this.start
        this.defWise = defWise

    }

    eraserRes: EraserRes = {isEraser: false};
    eraser(position: Position):EraserRes {
        if (this.eraserRes.isEraser) {
            return this.eraserRes
        }
        const distance = Math.min(...this.path.map(xy => tools.distanceBetweenPoints(new Position(xy, PositionType.real), position)))
        if(distance <= this.panStyle.size){
            this.eraserRes = {isEraser: true}
            return this.eraserRes
        }
        this.eraserRes = {isEraser: false}
        return this.eraserRes
    }
    undo(){
        this.eraserRes = {isEraser: false}
    }


    moveTo(position: Position): void {
        this.end = position

        const controlPosition = this.getControlPoint()
        this.control = controlPosition
        this.controlChangeCallback(controlPosition)
    }
    moveEnd(){
        const end_matrix = this.end.getMatrixPosition()
        this.end = new Position(end_matrix.x, end_matrix.y, PositionType.matrix)
        this.isEnd = true

        const {left, right} = this.param
        this.path = [
            ...tools.getBezierPath(left.a1, left.a2, left.c),
            ...tools.getBezierPath(right.a1, right.a2, right.c)
        ]
    }
    getControlPoint() { 
        const start = this.start.getRealPosition()
        const end = this.end.getRealPosition()
        const control = this.control
        if(!start || !end){
            return null
        }
        const xy = calculateEquilateralTriangle(start,end,50, this.defWise === 'right').C
        return new Position(xy.x, xy.y, PositionType.real)
    }
    controlChangeCallback: (position: Position | null) => void = (position: Position | null) => {};
    registerControlChangeCallBack(callBack: (position: Position | null) => void) {
        this.controlChangeCallback = callBack
    }
    draw(ctx: UniApp.CanvasContext) {
        if (this.eraserRes.isEraser) {
            return
        }

        const start = this.start.getRealPosition()
        const end = this.end.getRealPosition()
        const control = this.control?.getRealPosition()
        if (!start || !end || !control) {
            return
        }

        const whichSide = whichSideOfLine(start,end,control)
        const scale = 0.3
        const panStyle = this.panStyle
        
        ctx.beginPath()
        ctx.setStrokeStyle(panStyle.color)
        ctx.setLineWidth(panStyle.size)
        ctx.stroke()
        const f = getGoodControlPoint(start,end,control)

        // 画2条
        
        ctx.moveTo(start.x, start.y)
        const lineAControl = {
            x: f.right[0],
            y: f.right[1]
        }
        ctx.quadraticCurveTo(lineAControl.x, lineAControl.y, control.x, 
            control.y
        )
        const lineBControl = {
            x: f.left[0],
            y: f.left[1]
        }
        ctx.quadraticCurveTo(lineBControl.x, lineBControl.y, end.x, 
            end.y
        )

        ctx.stroke()


        this.param.left = {
            a1: this.start,
            a2: new Position(control, PositionType.real),
            c: new Position(lineAControl, PositionType.real)
        }
        this.param.right = {
            a1: new Position(control, PositionType.real),
            a2: this.end,
            c: new Position(lineBControl, PositionType.real)
        }
    }
}

// 贝塞尔曲线控制点
export class BezierControl extends baseGraph { 
    bezier: Bezier
    position: Position | null
    controlEvent: ControlEvent;
    controlId: string;
    r=uni.upx2px(10);
    target: baseGraph;
    clickGraph: ClickGraph;

    static bezierControlList: BezierControl[] = [];
    timer: number = 0;

    table: Table;
    constructor(bezier: Bezier, panStyle:PanStyle, controlEvent: ControlEvent, target: baseGraph, table:Table) { 
        super(panStyle, new Position(0,0, PositionType.real))
        this.bezier = bezier
        this.position = bezier.control

        this.controlEvent = controlEvent
        this.target = target

        this.clickGraph = new ClickGraph('Circle', this.position, uni.upx2px(70))
        this.clickGraph.registerDrawFn(this.drawPointIcon.bind(this))
        this.registEventToTable()
        
        const that = this;
        bezier.registerControlChangeCallBack(function(position: Position | null){
            if (that.isRecycle) {
                return
            }
            if (position) {
                that.position = position
                that.clickGraph.setNewPosition(position)
            }
        })
        this.table = table
        BezierControl.bezierControlList.forEach(item => item.recycle())
        BezierControl.bezierControlList.push(this)
    }
    registEventToTable(){
        const controlEvent = this.controlEvent
        const target = this.target
        this.controlId = controlEvent.registerEvent('touchmove', {
            clickGraph: this.clickGraph,
            callBack: (start, now, table) => {
                this.timer ? (clearTimeout(this.timer),this.timer = 0) : ''
                table.upToNowDraw(target)
                this.moveTo(now)
            },
            moveend:(table) => {
                console.log("end")
                this.moveEnd()
            },
        })
    }

    isRecycle = false
    recycle(): void {
        // 解绑事件
        console.log("清除")
        this.isRecycle = true
        this.controlEvent.recycle(this.controlId)
    }
    moveTo(position: Position): void {
        this.position = position
        this.bezier.control = position
    }
    moveEnd(){
        this.timer = setTimeout(()=>{
            this.recycle()
            this.table.tableCanvasContext.control_canvas.draw()
        }, 3000)
        if (this.position) {
            this.clickGraph.setNewPosition(this.position)   
        }else{
            console.error("bezierControl.moveTo: position is null")
        }
    }
    drawPointIcon(ctx: UniApp.CanvasContext){
        const real = this.position?.getRealPosition()
        if (real) {
            ctx.beginPath()
            ctx.arc(real.x, real.y, this.r, 0, 2 * Math.PI)
            ctx.setFillStyle(this.panStyle.color)
            ctx.fill()
        }
    }

    draw(controlCTX: UniApp.CanvasContext): void {
        if (this.isRecycle) {
            return    
        }
        this.drawPointIcon(controlCTX)
    }
}

// 输出合适的控制点
function getGoodControlPoint(p1:{x:number, y:number}, p2:{x:number, y:number}, point:{x:number, y:number}) {
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    const x0 = point.x;
    const y0 = point.y;
    
    // 投影比例
    const t = 0.2

    // 向量
    const v1 = [x2 - x1, y2 - y1];
    
    return {
        left: [
            x0 + (t * v1[0])
            ,y0 + (t * v1[1])
        ],
        right: [
        x0 + (-t * v1[0])
            ,y0 + (-t * v1[1])
    ]
    };
}

/**
 * 判断点在线段的哪一侧
 * @param {Array} linePointA 线段起点 [x, y]
 * @param {Array} linePointB 线段终点 [x, y]  
 * @param {Array} point 需要判断的点 [x, y]
 * @returns {number} 1: 左侧, 0: 右侧或在线上
 */
function whichSideOfLine(linePointA: {x: number, y: number}, linePointB: {x: number, y: number}, point: {x: number, y: number}) {
    const x1 = linePointA.x, y1 = linePointA.x;
    const x2 = linePointB.x, y2 = linePointB.y;
    const x = point.x, y = point.y;
    
    // 计算叉积
    const crossProduct = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
    
    // 根据叉积的正负判断位置
    if (crossProduct > 0) {
        return 1; // 点在左侧
    } else {
        return 0; // 点在右侧或在线上
    }
}

function calculateEquilateralTriangle(point1: {x: number, y: number}, point2: {x: number, y: number}, height: number, clockwise = true) {
    // 计算底边的中点
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;
    
    // 计算底边的方向向量
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    
    // 计算垂直于底边的单位向量
    const perpendicularLength = Math.sqrt(dx * dx + dy * dy);
    let perpendicularX, perpendicularY;
    
    if (clockwise) {
        perpendicularX = -dy / perpendicularLength;
        perpendicularY = dx / perpendicularLength;
    } else {
        perpendicularX = dy / perpendicularLength;
        perpendicularY = -dx / perpendicularLength;
    }
    perpendicularX = Number.isNaN(perpendicularX) ? 1 : perpendicularX
    perpendicularY = Number.isNaN(perpendicularY) ? 1 : perpendicularY
    // 计算第三个顶点
    const vertexC = {
        x: midX + (perpendicularX * height),
        y: midY + (perpendicularY * height)
    };
    
    return {
        A: point1,
        B: point2,
        C: vertexC
    };
}

