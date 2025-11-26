import Table, {Position} from "./table";
import tools from "./tools";

interface Register {
    clickGraph: ClickGraph,
    callBack: (start: Position, now: Position, table: Table)=>void,
    moveStart?: (start, now, table) => void,
    moveend?: (table: Table)=>void
}

export default class ControlEvent {
    table: Table
    constructor(table: Table){this.table = table}
    moveEnd(touchId: string){
        if (touchId === this.lastTouchId) {
            const register = this.registerTouchMoveList.get(this.lastEventId)
            if (register && register.moveend) {
                register.moveend(this.table)
                this.draw()
            }
            return true
        }
        return false
    }
    lastEventId: string = tools.UUID()
    lastTouchId: string = tools.UUID()
    touchmove(touchId: string,start: Position, now: Position): Boolean{
        const realXY = start.getRealPosition()
        if (!realXY) {
            return false
        }
        const registerList = this.registerTouchMoveList
        if (this.lastTouchId === touchId) {
            const register = registerList.get(this.lastEventId);
            if (register) {
                register.callBack(start, now, this.table);
                this.draw()
                return true;
            }
        }
        for (const key of registerList.keys()) {
            const register = registerList.get(key);
            if (register && register.clickGraph.isInGraph(start)) {
                this.lastEventId = key;
                this.lastTouchId = touchId;
                if (register.moveStart) {
                    register.moveStart(now, now, this.table);   
                }
                register.callBack(start, now, this.table);
                this.draw()
                return true;
            }
        }
        return false;
    }
    // 点击
    tap(start: Position, now: Position): Boolean{
        const realXY = start.getRealPosition()
        if (!realXY) {
            return false
        }
        const registerList = this.registerClickList
        for (const key of registerList.keys()) {
            const register = registerList.get(key);
            if (register && register.clickGraph.isInGraph(start)) {
                register.callBack(start, now, this.table);
                this.draw()
                return true;
            }
        }
        return false;
    }

    /**
     * 注册事件
     * @param graph 点击区域的图形
     * @param callBack 点击回调
     */
    registerClickList:Map<string, Register> = new Map()
    registerTouchMoveList:Map<string, Register> = new Map()
    registerEvent(eventType: EventType, register: Register){
        console.log("注册事件", eventType)
        const symbol = tools.UUID()
        if (eventType === 'touchmove') {
            this.registerTouchMoveList.set(symbol, register);
        }else{
            this.registerClickList.set(symbol, register);
        }
        return symbol;
    }
    recycle(symbol: string){
        this.registerClickList.delete(symbol)
        this.registerTouchMoveList.delete(symbol)
    }

    // 这里绘制顶部控制层
    contralGraph: ClickGraph[] =[];
    draw(){
        const ctx = this.table.tableCanvasContext.control_canvas
        this.contralGraph.forEach(graph=>graph.draw(ctx))
        ctx.draw()
    }
}

export type EventType = 'click' | 'touchmove'
export type ClickGraphType = "Circle" | "Rect";
export class ClickGraph {
    type: ClickGraphType;

    // 圆独有
    center: Position;
    radius: number;

    // 矩形独有
    start: Position;
    end: Position;

    constructor(type: "Circle", center: Position, radius: number);
    constructor(type: "Rect", start: Position, end: Position);
    constructor(type: ClickGraphType, a: Position, b: Position|number){
        this.type = type
        if (type === "Circle" && typeof b === 'number') {
            this.center = a
            this.radius = b
        }else if (type === "Rect" && b instanceof Position) {
            this.start = a
            this.end = b
        }
    }

    isInGraph(position: Position): boolean {
        if (this.type === "Circle") {
            return tools.distanceBetweenPoints(this.center, position) < this.radius
        }else if (this.type === "Rect") {
            return tools.isPointInRectangle(position, this.start, this.end)
        }
        return false
    }
    setNewPosition(a: Position, b?: Position | number){
        if (this.type === 'Circle') {
            this.center = a;
            if(typeof b === 'number'){
                this.radius = b;
            }
        }else if (this.type === 'Rect') {
            if (!b) {
                console.error("矩形必须有end参数")
                return
            }
            this.start = a;
            this.end = b;
        }
    }
    drawFn: Function = () => {};
    registerDrawFn(fn: Function){
        this.drawFn = fn
    }
    draw(ctx: UniApp.CanvasContext): void {
        if (this.drawFn) {
            this.drawFn(ctx)
        }
    }
}