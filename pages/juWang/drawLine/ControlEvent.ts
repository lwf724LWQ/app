import Table, {Position} from "./table";
import tools from "./tools";

interface Register {
    clickGraph: ClickGraph,
    callBack: (start: Position, now: Position, table: Table)=>void
}
export default class ControlEvent {
    table: Table
    constructor(table: Table){this.table = table}
    touchmove(start: Position, now: Position): Boolean{
        const realXY = start.getRealPosition()
        if (!realXY) {
            return false
        }
        const registerList = this.registerTouchMoveList
        for (const key of registerList.keys()) {
            const register = registerList.get(key);
            if (register && register.clickGraph.isInGraph(start)) {
                register.callBack(start, now, this.table);
                this.table.tableCanvasContext.control_canvas.draw()
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
                this.table.tableCanvasContext.control_canvas.draw()
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
    registerClickList:Map<Symbol, Register> = new Map()
    registerTouchMoveList:Map<Symbol, Register> = new Map()
    registerEvent(eventType: EventType, register: Register){
        const symbol = Symbol("ControlEventId")
        if (eventType === 'touchmove') {
            this.registerTouchMoveList.set(symbol, register);
        }else{
            this.registerClickList.set(symbol, register);
        }
        return symbol;
    }
    recycle(Symbol: Symbol){
        this.registerClickList.delete(Symbol)
        this.registerTouchMoveList.delete(Symbol)
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
}