import {
	isApp,
	isH5
} from '../../../../main';
import {
	ref,
	nextTick
} from 'vue';

//查看平台（环境）
console.log(isApp, isH5, uni.getSystemInfoSync().platform)


export default function useDrawing(numberGroups, highlighted, numberRefs, showNumberSelectorCallback, isH5,
	drawCanvasRef, tempCanvasRef) {

	//初始化H5状态决定下面的if判断进步进入
	// isH5 = platform === 'web'|| platform === 'windows'||platform === 'mac';//判断是否是h5环境中
	// const isApp = platform === 'android' || platform === 'ios';//判断小程序是否是安卓或者苹果环境中

	// 模式状态管理
	const currentMode = ref('freeDraw'); // straightLine,freeDraw, rectangle, circle, smart, text, eraser
	const isDrawing = ref(false);
	const isErasing = ref(false);
	// 控制Canvas的事件穿透
	const canvasPointerEvents = ref('auto');

	// 固定样式设置
	const strokeColor = ref('#3B82F6');
	const lineWidth = ref(3);

	// Canvas相关
	const canvasCtx = ref(null);
	const tempCanvasCtx = ref(null);
	const canvasSize = ref({
		w: 0,
		h: 0
	});
	const dpr = ref(1);

	// 绘制状态
	const currentShape = ref({
		start: {
			x: 0,
			y: 0
		},
		end: {
			x: 0,
			y: 0
		},
		points: [] // 用于自由绘制的点数组
	});
	const shapes = ref([]); // 存储所有绘制的图形

	// 橡皮擦相关配置
	const eraserSize = ref(30);

	// 重置当前图形
	const resetCurrentShape = () => {
		currentShape.value = {
			start: {
				x: 0,
				y: 0
			},
			end: {
				x: 0,
				y: 0
			},
			points: []
		};
	};

	// 检查点是否在不可绘制区域（前两列）
	const isPointInNonDrawableArea = (point) => {
		const canvasDomRect = canvasCtx.value?.canvas.getBoundingClientRect();
		if (!canvasDomRect) return false;

		// 获取表格元素
		const table = document.querySelector('.numbers-table');
		if (!table) return false;

		// 获取表格第一列的DOM元素
		const firstColCells = table.querySelectorAll('.col-1');

		if (!firstColCells.length) return false;

		// 获取第一列的宽度作为不可绘制区域的边界
		const firstColWidth = firstColCells[0].getBoundingClientRect().width;
		const totalNonDrawableWidth = firstColWidth;

		// 计算点在表格中的相对X坐标
		const tableRect = table.getBoundingClientRect();
		const pointXInTable = point.x + canvasDomRect.left - tableRect.left;

		// 如果点在前两列范围内，返回true
		return pointXInTable <= totalNonDrawableWidth;
	};

	// 检查点是否在数字元素上（仅第3-7列）
	const checkPointOnNumber = (point) => {
		// 首先检查是否在前两列的不可绘制区域
		if (isPointInNonDrawableArea(point)) {
			return null;
		}

		if (!numberRefs.value || numberRefs.value.length === 0) {
			return null;
		}

		for (let i = 0; i < numberRefs.value.length; i++) {
			let el = numberRefs.value[i];

			if (el && el.$el) {
				el = el.$el;
			}

			if (!el || !(el instanceof HTMLElement) || !el.getBoundingClientRect) {
				continue;
			}

			try {
				const rect = el.getBoundingClientRect();
				const canvasRect = canvasCtx.value?.canvas.getBoundingClientRect();

				if (!canvasRect) continue;

				const adjustedX = point.x + canvasRect.left;
				const adjustedY = point.y + canvasRect.top;

				if (adjustedX >= rect.left && adjustedX <= rect.right &&
					adjustedY >= rect.top && adjustedY <= rect.bottom) {
					// 获取该数字所在的组索引和数字索引
					const groupIndex = parseInt(el.dataset.groupIndex);
					const numIndex = parseInt(el.dataset.numIndex);
					
					return {
						groupIndex,
						numIndex
					};
				}
			} catch (error) {
				console.error('检查点在数字上时出错:', error);
				continue;
			}
		}
		return null;
	};

	/**
	 * 清除临时画布
	 */
	const clearTempCanvas = () => {
		if (tempCanvasCtx.value) {
			tempCanvasCtx.value.clearRect(0, 0, canvasSize.value.w, canvasSize.value.h);
		}
	};

	/**
	 * 绘制直线
	 */
	const drawStraightLine = (start, end, color, width, context = canvasCtx.value) => {
		if (!context) return;
		// 检查起点或终点是否在前两列，若是则不绘制
		if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
			return;
		}
		context.beginPath();
		context.moveTo(start.x, start.y);
		context.lineTo(end.x, end.y);
		context.strokeStyle = color;
		context.lineWidth = width;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.stroke();
	};

	/**
	 * 绘制自由线条
	 */
	const drawFreeLine = (points, color, width, context = canvasCtx.value) => {
		if (!context || points.length < 2) return; // 如果上下文不存在或点数少于2（无法形成一条线），则直接返回

		// 过滤掉前两列区域的点
		const filteredPoints = points.filter(point => !isPointInNonDrawableArea(point));

		if (filteredPoints.length < 2) return; // 如果过滤后的点数少于2，则返回（无法绘制）

		context.beginPath();
		context.moveTo(filteredPoints[0].x, filteredPoints[0].y);

		for (let i = 1; i < filteredPoints.length; i++) {
			context.lineTo(filteredPoints[i].x, filteredPoints[i].y);
		}

		context.strokeStyle = color;
		context.lineWidth = width;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.stroke();
	};

	/**
	 * 绘制矩形
	 */
	const drawRectangle = (start, end, color, width, context = canvasCtx.value) => {
		
		if (!context) return;

		// 检查起点或终点是否在前两列，若是则不绘制
		if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
			return;
		}

		const x = Math.min(start.x, end.x);
		const y = Math.min(start.y, end.y);
		const widthRect = Math.abs(end.x - start.x);
		const heightRect = Math.abs(end.y - start.y);

		context.strokeStyle = color;
		context.lineWidth = 6;
		context.strokeRect(x, y, widthRect, heightRect);
		
	};

	// 绘制椭圆路径（兼容方案）
	const drawEllipsePath = (ctx, cx, cy, rx, ry) => {
		// 使用贝塞尔曲线模拟椭圆
		const kappa = 0.5522848;
		const ox = rx * kappa; // 水平控制点偏移
		const oy = ry * kappa; // 垂直控制点偏移

		ctx.beginPath();
		// 从右中开始
		ctx.moveTo(cx + rx, cy);
		// 右上弧线
		ctx.bezierCurveTo(cx + rx, cy - oy, cx + ox, cy - ry, cx, cy - ry);
		// 左上弧线
		ctx.bezierCurveTo(cx - ox, cy - ry, cx - rx, cy - oy, cx - rx, cy);
		// 左下弧线
		ctx.bezierCurveTo(cx - rx, cy + oy, cx - ox, cy + ry, cx, cy + ry);
		// 右下弧线
		ctx.bezierCurveTo(cx + ox, cy + ry, cx + rx, cy + oy, cx + rx, cy);
		ctx.closePath();
	};

	/**
	 * 绘制圆形
	 */
	const drawCircle = (start, end, color, width, context = canvasCtx.value) => {
		if (!context) return;

		// 检查起点或终点是否在前两列，若是则不绘制
		if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
			return;
		}

		const xRadius = Math.abs(end.x - start.x) / 2;
		const yRadius = Math.abs(end.y - start.y) / 2;
		const centerX = start.x + (end.x - start.x) / 2;
		const centerY = start.y + (end.y - start.y) / 2;

		// 绘制当前椭圆（使用兼容方法）
		drawEllipsePath(context, centerX, centerY, xRadius, yRadius);

		context.strokeStyle = color;
		context.lineWidth = width;
		context.stroke();
	};
	/**
	 * 绘制智能曲线，包括当前线条、上两格线条和上四格线条
	 */
	const drawSmartCurve = (start, end, color2, width, context = canvasCtx.value, point) => {
		let color = "#1a1ad9"
		if (!context) return;
		// 检查起点或终点是否在前两列，若是则不绘制
		if (isPointInNonDrawableArea(start) || isPointInNonDrawableArea(end)) {
			return;
		}

		// 检查起点是否在数字上，并添加高亮
		const startNum = checkPointOnNumber(start);
		if (startNum) {
			const exists = highlighted.value.some(
				item => item.groupIndex === startNum.groupIndex &&
				item.numIndex === startNum.numIndex
			);
			if (!exists) {
				highlighted.value.push({
					groupIndex: startNum.groupIndex,
					numIndex: startNum.numIndex,
				});
			}
		}

		// 计算控制点（让曲线弧度朝下）
		const controlX = start.x;

		const controlY = start.y;
		// 计算行高（用于线条位置计算）
		const rowHeight = canvasSize.value.h / numberGroups.value;
		// 绘制当前线条
		context.beginPath();


		context.moveTo(start.x, start.y);
		context.quadraticCurveTo(controlX, controlY, end.x, end.y);
		context.strokeStyle = color;
		context.lineWidth = width;
		context.lineCap = 'round';
		context.stroke();
		// console.log(2);

		// 绘制当前点指示
		context.fillStyle = color;
		context.beginPath();
		context.arc(start.x, start.y, 5, 0, Math.PI * 2);
		context.arc(end.x, end.y, 5, 0, Math.PI * 2);
		context.fill();

		// 上两格线条
		// const twoUpStart = {
		// 	x: start.x,
		// 	y: start.y - rowHeight * 3
		// };
		// const twoUpEnd = {
		// 	x: end.x,
		// 	y: end.y - rowHeight * 3
		// };
		// const twoUpControlY = controlY - rowHeight * 3;

		// context.beginPath();
		// context.moveTo(twoUpStart.x, twoUpStart.y);
		// context.quadraticCurveTo(controlX, twoUpControlY, twoUpEnd.x, twoUpEnd.y);
		// context.strokeStyle = `${color}`; // 透明度80%
		// context.lineWidth = width;
		// context.lineCap = 'round';
		// context.stroke();

		// // 上两格点指示
		// context.fillStyle = `${color}`;
		// context.beginPath();
		// context.arc(twoUpStart.x, twoUpStart.y, 4, 0, Math.PI * 2);
		// context.arc(twoUpEnd.x, twoUpEnd.y, 4, 0, Math.PI * 2);
		// context.fill();

		// 上四格线条
		// const fourUpStart = {
		// 	x: start.x,
		// 	y: start.y - rowHeight * 6
		// };
		// const fourUpEnd = {
		// 	x: end.x,
		// 	y: end.y - rowHeight * 6
		// };
		// const fourUpControlY = controlY - rowHeight * 6;

		// context.beginPath();
		// context.moveTo(fourUpStart.x, fourUpStart.y);
		// context.quadraticCurveTo(controlX, fourUpControlY, fourUpEnd.x, fourUpEnd.y);
		// context.strokeStyle = `${color}`; // 透明度50%
		// context.lineWidth = width;
		// context.lineCap = 'round';
		// context.stroke();

		// 上四格点指示
		// context.fillStyle = `${color}50`;
		// context.beginPath();
		// context.arc(fourUpStart.x, fourUpStart.y, 4, 0, Math.PI * 2);
		// context.arc(fourUpEnd.x, fourUpEnd.y, 4, 0, Math.PI * 2);
		// context.fill();
	};

	/**
	 * 计算点到直线的距离
	 */
	const pointLineDistance = (point, start, end) => {
		const A = point.x - start.x;
		const B = point.y - start.y;
		const C = end.x - start.x;
		const D = end.y - start.y;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;
		let param = -1;

		if (lenSq !== 0) param = dot / lenSq;

		let xx, yy;

		if (param < 0) {
			xx = start.x;
			yy = start.y;
		} else if (param > 1) {
			xx = end.x;
			yy = end.y;
		} else {
			xx = start.x + param * C;
			yy = start.y + param * D;
		}

		return Math.hypot(point.x - xx, point.y - yy);
	};

	/**
	 * 检查点是否靠近形状
	 */
	const isPointNearShape = (point, shape) => {
		// 如果点在前两列区域，不执行擦除
		if (isPointInNonDrawableArea(point)) {
			return false;
		}

		if (shape.type === 'freeDraw') {
			// 检查是否靠近自由线条的任何线段
			for (let i = 0; i < shape.points.length - 1; i++) {
				if (pointLineDistance(point, shape.points[i], shape.points[i + 1]) < eraserSize.value / 2) {
					return true;
				}
			}
			return false;
		} else if (shape.type === 'rectangle' || shape.type === 'straightLine') {
			// 简化检查：检查是否在矩形周围区域
			const x = Math.min(shape.start.x, shape.end.x);
			const y = Math.min(shape.start.y, shape.end.y);
			const width = Math.abs(shape.end.x - shape.start.x);
			const height = Math.abs(shape.end.y - shape.start.y);

			return point.x >= x - eraserSize.value / 2 &&
				point.x <= x + width + eraserSize.value / 2 &&
				point.y >= y - eraserSize.value / 2 &&
				point.y <= y + height + eraserSize.value / 2;
		} else if (shape.type === 'circle') {
			// 检查是否靠近圆形
			const radius = Math.sqrt(
				Math.pow(shape.end.x - shape.start.x, 2) +
				Math.pow(shape.end.y - shape.start.y, 2)
			);
			const distanceFromCenter = Math.hypot(point.x - shape.start.x, point.y - shape.start.y);

			// 检查是否在圆内或靠近圆周
			return Math.abs(distanceFromCenter - radius) < eraserSize.value / 2 ||
				distanceFromCenter < eraserSize.value / 2;
		} else if (shape.type === 'smart') {
			// 检查是否靠近智能曲线
			const controlX = (shape.start.x + shape.end.x) / 2;
			const controlY = (shape.start.y + shape.end.y) / 2 + Math.abs(shape.start.x - shape.end.x) / 3;

			// 简化检查：检查与起点、终点和控制点的距离
			const distToStart = Math.hypot(point.x - shape.start.x, point.y - shape.start.y);
			const distToEnd = Math.hypot(point.x - shape.end.x, point.y - shape.end.y);
			const distToControl = Math.hypot(point.x - controlX, point.y - controlY);

			return Math.min(distToStart, distToEnd, distToControl) < eraserSize.value / 1.5;
		}

		return false;
	};

	/**
	 * 检查点是否在文字标签上
	 */
	const checkPointOnTextLabel = (point) => {
		// 如果点在前两列区域，不执行操作
		if (isPointInNonDrawableArea(point)) {
			return -1;
		}

		// 这个函数需要访问textLabels，我们从主组件传入或通过其他方式获取
		// 这里假设在主组件中会处理文字标签的擦除
		return -1;
	};

	/**
	 * 执行擦除操作
	 */
	const performErase = (point) => {
		// 如果点在前两列区域，不执行擦除
		if (isPointInNonDrawableArea(point)) {
			return;
		}

		// 1. 检查是否擦到数字高亮
		const numberPos = checkPointOnNumber(point);
		if (numberPos) {
			const {
				groupIndex,
				numIndex
			} = numberPos;
			const idx = highlighted.value.findIndex(item =>
				item.groupIndex === groupIndex && item.numIndex === numIndex
			);
			if (idx > -1) {
				highlighted.value.splice(idx, 1);
			}
		}

		// 2. 检查是否擦到形状（从后往前检查）
		for (let i = shapes.value.length - 1; i >= 0; i--) {
			if (isPointNearShape(point, shapes.value[i])) {
				shapes.value.splice(i, 1);
			}
		}
	};

	/**
	 * 获取相对Canvas的坐标
	 */
	const getRelativeCoordinates = (e) => {
		const canvas = canvasCtx.value?.canvas;
		if (!canvas) return {
			x: 0,
			y: 0
		};

		const canvasDomRect = canvas.getBoundingClientRect();
		if (!canvasDomRect) return {
			x: 0,
			y: 0
		};

		let clientX, clientY;

		// 处理不同环境下的坐标获取
		if (e.touches && e.touches.length > 0) {
			// 移动端触摸事件
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else if (e.clientX !== undefined) {
			// PC端鼠标事件
			clientX = e.clientX;
			console.log(clientX)
			clientY = e.clientY;
		} else {
			// 其他情况
			return {
				x: 0,
				y: 0
			};
		}

		return {
			x: clientX - canvasDomRect.left,
			y: clientY - canvasDomRect.top
		};
	};

	/**
	 * 开始画布操作
	 */
	const onCanvasStart = (e) => {
		console.log('Canvas 开始操作');
		const coords = getRelativeCoordinates(e);

		// 如果点在前两列区域，不执行任何绘制操作并允许事件穿透
		if (isPointInNonDrawableArea(coords)) {
			e.stopPropagation();
			return;
		}

		// 点击Canvas时禁用事件穿透
		canvasPointerEvents.value = 'none';

		// 使用定时器将时间穿透恢复
		let timerId = null;
		if (timerId) {
			clearTimeout(timerId);
			timerId = null;
		}
		timerId = setTimeout(() => {
			canvasPointerEvents.value = 'auto';
			timerId = null;
		}, 300);



		if (currentMode.value === 'eraser') {
			// 橡皮擦模式
			isErasing.value = true;
			performErase(coords);
			redraw(false);
		} else if (['straightLine', 'freeDraw', 'rectangle', 'circle', 'smart'].includes(currentMode.value)) {
			// 绘图模式
			isDrawing.value = true;
			currentShape.value.start = {
				...coords
			};
			currentShape.value.end = {
				...coords
			};

			// 自由绘制模式下记录第一个点
			if (currentMode.value === 'freeDraw') {
				currentShape.value.points = [coords];
				//测试代码
				console.log(currentShape.value.points)
			}
		}


	};




	let animationFrameId = null;
	/**
	 * 画布移动操作
	 */
	const onCanvasMove = (e) => {
		// if (!canvasCtx.value || (!isDrawing.value && !isErasing.value)) {
		// 	console.log('Canvas 上下文未初始化或未处于绘制状态',canvasCtx.value);
		// 	return;
		// }

		// 取消之前的动画帧
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
		}
		animationFrameId = requestAnimationFrame(() => {
			// 获取坐标
			const coords = getRelativeCoordinates(e);

			// ...其他逻辑

			if (isDrawing.value) {
				// 更新当前点
				currentShape.value.end = {
					...coords
				};

				// 自由绘制模式下记录所有点
				if (currentMode.value === 'freeDraw') {
					currentShape.value.points.push(coords);
				}
				// 绘制临时预览
				drawTemporaryShape(true);
			}

			animationFrameId = null;
		});



		const coords = getRelativeCoordinates(e);

		// 如果点在前两列区域，不执行任何操作
		if (isPointInNonDrawableArea(coords)) {
			return;
		}

		e.preventDefault();

		if (currentMode.value === 'eraser' && isErasing.value) {
			// 橡皮擦移动擦除
			performErase(coords);
			redraw(false);
		} else if (isDrawing.value) {
			// 更新当前点
			currentShape.value.end = {
				...coords
			};

			// 自由绘制模式下记录所有点
			if (currentMode.value === 'freeDraw') {
				currentShape.value.points.push(coords);
			}

			// 绘制临时预览，鼠标按住移动的时候绘制，根据当前是什么绘制类型，来绘制不同的
			drawTemporaryShape();
		}

	};

	/**
	 * 绘制临时形状（用于预览）就是画的时候路线会随着鼠标移动即时更新
	 */
	const drawTemporaryShape = () => {
		if (!tempCanvasCtx.value) return;

		// 如果是自由绘制模式且处于绘制中，采用增量绘制
		if (currentMode.value === 'freeDraw' && isDrawing.value && currentShape.value.points.length > 1) {
			// 只绘制当前新增的线段
			const points = currentShape.value.points;
			const startPoint = points[points.length - 2];
			const endPoint = points[points.length - 1];


			tempCanvasCtx.value.beginPath();
			tempCanvasCtx.value.moveTo(startPoint.x, startPoint.y);
			tempCanvasCtx.value.lineTo(endPoint.x, endPoint.y);
			tempCanvasCtx.value.strokeStyle = strokeColor.value;
			tempCanvasCtx.value.lineWidth = lineWidth.value;
			tempCanvasCtx.value.lineCap = 'round';
			tempCanvasCtx.value.stroke();
		} else {


			// 先把之前画的内容也绘制到临时画布
			console.log(tempCanvasCtx)
			if (tempCanvasCtx.value) {
				tempCanvasCtx.value.clearRect(0, 0, canvasSize.value.w, canvasSize.value.h);
				// 把所有已保存的图形绘制到临时画布
				shapes.value.forEach(shape => {
					switch (shape.type) {
						case 'straightLine':
							drawStraightLine(shape.start, shape.end, shape.color, shape.width, tempCanvasCtx
								.value);
							break;
						case 'freeDraw':
							drawFreeLine(shape.points, shape.color, shape.width, tempCanvasCtx.value);
							break;
						case 'rectangle':
							drawRectangle(shape.start, shape.end, shape.color, shape.width, tempCanvasCtx
								.value);
							break;
						case 'circle':
							drawCircle(shape.start, shape.end, shape.color, shape.width, tempCanvasCtx
								.value);
							break;
						case 'smart':
							if (shape.startNum && shape.endNum) {
								drawSmartCurve(shape.start, shape.end, shape.color, shape.width,
									tempCanvasCtx
									.value);
							} else {
								drawFreeLine([shape.start, shape.end], shape.color, shape.width,
									tempCanvasCtx
									.value);
							}
							break;
					}
				});
			}
		}

		// 再绘制当前预览形状
		if (!tempCanvasCtx.value) return;

		switch (currentMode.value) {
			case 'straightLine':
				drawStraightLine(currentShape.value.start, currentShape.value.end, strokeColor.value, lineWidth
					.value, tempCanvasCtx.value);
				break;
			case 'freeDraw':
				if (currentShape.value.points.length > 1) {
					drawFreeLine(currentShape.value.points, strokeColor.value, lineWidth.value, tempCanvasCtx
						.value);
				}
				break;
			case 'rectangle':
				drawRectangle(currentShape.value.start, currentShape.value.end, strokeColor.value, lineWidth.value,
					tempCanvasCtx.value);
				break;
			case 'circle':
				drawCircle(currentShape.value.start, currentShape.value.end, strokeColor.value, lineWidth.value,
					tempCanvasCtx.value);
				break;
			case 'smart':
				const startNum = checkPointOnNumber(currentShape.value.start);
				const endNum = checkPointOnNumber(currentShape.value.end);

				if (startNum && endNum) {
					drawSmartCurve(currentShape.value.start, currentShape.value.end, '#66dd99', lineWidth.value,
						tempCanvasCtx.value);
				} else {
					drawFreeLine(
						[currentShape.value.start, currentShape.value.end],
						'#ff6688',
						lineWidth.value,
						tempCanvasCtx.value
					);
				}
				break;
		}
	};

	/**
	 * 结束画布操作
	 */
	const onCanvasEnd = () => {
		const endPoint = currentShape.value.end;
		const numberPos = checkPointOnNumber(endPoint);
		//为了解决web端绘制无法及时更新
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}


		if (numberPos) {
			const {
				groupIndex,
				numIndex
			} = numberPos;
			// 如果是智能模式，并且终点在46-49行，1-4列
			if (currentMode.value === 'smart' && groupIndex >= 106 && groupIndex <= 110 && numIndex == 1) {
				if (showNumberSelectorCallback) {
					showNumberSelectorCallback(groupIndex, numIndex);
				}

			}
			if (currentMode.value === 'smart' && groupIndex >= 106 && groupIndex <= 110 && numIndex == 2) {
				if (showNumberSelectorCallback) {
					showNumberSelectorCallback(groupIndex, numIndex);
				}
			}
			if (currentMode.value === 'smart' && groupIndex >= 106 && groupIndex <= 110 && numIndex == 3) {
				if (showNumberSelectorCallback) {
					showNumberSelectorCallback(groupIndex, numIndex);
				}
			}
			if (currentMode.value === 'smart' && groupIndex >= 106 && groupIndex <= 110 && numIndex == 4) {
				if (showNumberSelectorCallback) {
					showNumberSelectorCallback(groupIndex, numIndex);
				}
			}
			if (currentMode.value === 'smart' && groupIndex >= 106 && groupIndex <= 110 && numIndex == 5) {
				if (showNumberSelectorCallback) {
					showNumberSelectorCallback(groupIndex, numIndex);
				}
			}
		}


		if (currentMode.value === 'eraser') {
			isErasing.value = false;
		} else if (isDrawing.value) {
			// 检查起点或终点是否在前两列区域
			if (isPointInNonDrawableArea(currentShape.value.start) ||
				isPointInNonDrawableArea(currentShape.value.end)) {
				// 如果任何一点在前两列，不保存形状
				isDrawing.value = false;
				resetCurrentShape();
				clearTempCanvas();
				return;
			}

			// 保存绘制的形状
			const shape = {
				type: currentMode.value,
				start: {
					...currentShape.value.start
				},
				end: {
					...currentShape.value.end
				},
				points: [...currentShape.value.points],
				color: strokeColor.value,
				width: lineWidth.value
			};

			// 仅保存有意义的形状
			if (currentMode.value === 'freeDraw' && shape.points.length > 1) {
				// 过滤掉前两列区域的点
				shape.points = shape.points.filter(point => !isPointInNonDrawableArea(point));
				if (shape.points.length > 1) {
					shapes.value.push(shape);
				}
			} else if (['rectangle', 'straightLine', 'circle'].includes(currentMode.value)) {
				const size = Math.hypot(
					shape.end.x - shape.start.x,
					shape.end.y - shape.start.y
				);
				if (size > 5) { // 忽略太小的形状
					shapes.value.push(shape);
				}
			} else if (currentMode.value === 'smart') {
				const startNum = checkPointOnNumber(shape.start);
				const endNum = checkPointOnNumber(shape.end);
				const lineLength = Math.hypot(
					shape.end.x - shape.start.x,
					shape.end.y - shape.start.y
				);

				if (lineLength > 10) {
					// 保存智能模式信息
					shape.startNum = startNum;
					shape.endNum = endNum;
					shapes.value.push(shape);


					if (startNum && endNum) {
						// 辅助函数：添加高亮（避免重复）
						const addHighlight = (groupIdx, numIdx) => {
							const exists = highlighted.value.some(
								item => item.groupIndex === groupIdx && item.numIndex === numIdx
							);
							if (!exists) {
								highlighted.value.push({
									groupIndex: groupIdx,
									numIndex: numIdx,
								});
							}
						};

						// 高亮当前格子
						addHighlight(startNum.groupIndex, startNum.numIndex);
						addHighlight(endNum.groupIndex, endNum.numIndex);


						// 计算上两格的格子索引并高亮（确保不小于0）
						// const twoUpStartGroup = startNum.groupIndex - 3;
						// const twoUpEndGroup = endNum.groupIndex - 3;
						// if (twoUpStartGroup >= 0) {
						// 	addHighlight(twoUpStartGroup, startNum.numIndex);
						// }
						// if (twoUpEndGroup >= 0) {
						// 	addHighlight(twoUpEndGroup, endNum.numIndex);
						// }

						// 计算上四格的格子索引并高亮（确保不小于0）
						// const fourUpStartGroup = startNum.groupIndex - 6;
						// const fourUpEndGroup = endNum.groupIndex - 6;
						// if (fourUpStartGroup >= 0) {
						// 	addHighlight(fourUpStartGroup, startNum.numIndex);
						// }
						// if (fourUpEndGroup >= 0) {
						// 	addHighlight(fourUpEndGroup, endNum.numIndex);
						// }
					}
				}
			}

			isDrawing.value = false;
			resetCurrentShape();
			clearTempCanvas();
			redraw(false);
		}

	};

	/**
	 * 重绘所有内容
	 */
	const redraw = (includeTemp = false) => {
		if (!canvasCtx.value) return;

		// 清空画布
		canvasCtx.value.clearRect(0, 0, canvasSize.value.w, canvasSize.value.h);

		// 绘制所有保存的形状
		shapes.value.forEach(shape => {
			switch (shape.type) {
				case 'straightLine':
					drawStraightLine(shape.start, shape.end, shape.color, shape.width);
					break;
				case 'freeDraw':
					drawFreeLine(shape.points, shape.color, shape.width);
					break;
				case 'rectangle':
					drawRectangle(shape.start, shape.end, shape.color, shape.width);
					break;
				case 'circle':
					drawCircle(shape.start, shape.end, shape.color, shape.width);
					break;
				case 'smart':
					if (shape.startNum && shape.endNum) {
						drawSmartCurve(shape.start, shape.end, shape.color, shape.width);
					} else {
						drawFreeLine([shape.start, shape.end], shape.color, shape.width);
					}
					break;
			}
		});

		// 橡皮擦模式下绘制指示器
		if (currentMode.value === 'eraser' && isErasing.value) {
			drawEraserIndicator();
		}
	};

	/**
	 * 绘制橡皮擦指示
	 */
	const drawEraserIndicator = () => {
		if (!canvasCtx.value) return;

		const lastPoint = currentShape.value.end;
		canvasCtx.value.beginPath();
		canvasCtx.value.arc(lastPoint.x, lastPoint.y, eraserSize.value / 2, 0, Math.PI * 2);
		canvasCtx.value.strokeStyle = 'rgba(255, 0, 0, 0.5)';
		canvasCtx.value.lineWidth = 2;
		canvasCtx.value.stroke();
		canvasCtx.value.fillStyle = 'rgba(255, 0, 0, 0.1)';
		canvasCtx.value.fill();
	};

	/**
	 * 安全地移除事件监听器
	 */
	const safeRemoveEventListener = (container, event, handler) => {
		if (container && container.removeEventListener) {
			container.removeEventListener(event, handler);
		}
	};

	/**
	 * 安全地添加事件监听器
	 */
	const safeAddEventListener = (container, event, handler, options) => {
		if (container && container.addEventListener) {
			container.addEventListener(event, handler, options);

		}
	};

	/**
	 * 设置表格滚动监听
	 */
	const setupTableScrollListener = () => {
		// 尝试多种可能的滚动容器选择器
		const possibleContainers = [
			document.querySelector('.numbers-table-container'), // 表格容器
			document.querySelector('.container'), // 最外层容器
			document.querySelector('.numbers-table')?.parentElement, // 表格的直接父元素
			document.scrollingElement, // 页面滚动容器
			window // 窗口对象
		];

		// 过滤掉null/undefined的容器
		const validContainers = possibleContainers.filter(container => container != null);

		// 为每个有效的容器添加滚动事件监听
		validContainers.forEach(container => {
			// 先移除可能存在的旧监听，避免重复
			safeRemoveEventListener(container, 'scroll', handleTableScroll);
			// 添加新的滚动监听
			safeAddEventListener(container, 'scroll', handleTableScroll);
		});

		// 同时监听触摸滚动事件（移动设备）
		safeRemoveEventListener(document, 'touchmove', handleTouchScroll);
		safeAddEventListener(document, 'touchmove', handleTouchScroll, {
			passive: true
		});

	};

	/**
	 * 表格滚动处理函数
	 */
	const handleTableScroll = () => {
		canvasPointerEvents.value = 'auto';
		// console.log('2')
	};

	/**
	 * 触摸滚动处理函数（移动设备）
	 */
	const handleTouchScroll = () => {
		canvasPointerEvents.value = 'auto';
		// console.log('2')
	};

	/**
	 * 初始化Canvas
	 */
	const initCanvas = async () => {
		try {
			await nextTick();

			// 确保 DOM 完全加载
			if (document.readyState !== 'complete') {
				await new Promise(resolve => {
					if (document.readyState === 'complete') {
						resolve();
					} else {
						document.addEventListener('DOMContentLoaded', resolve);
					}
				});
			}

			let canvasEl = null;
			let tempCanvasEl = null;

			// 优先使用传入的 ref
			if (drawCanvasRef && drawCanvasRef.value) {
				canvasEl = drawCanvasRef.value;
			} else {
				// 备选方案：使用选择器
				canvasEl = document.querySelector('.draw-canvas');
			}

			if (tempCanvasRef && tempCanvasRef.value) {
				tempCanvasEl = tempCanvasRef.value;
			} else {
				tempCanvasEl = document.querySelector('.temp-canvas');
			}

			if (!canvasEl) {
				console.error('主 Canvas 元素未找到');
				return;
			}

			// 获取表格容器高度
			const tableContainer = document.querySelector('.numbers-table');
			let containerHeight = 0;
			console.log(tableContainer.getBoundingClientRect().height)
			if (tableContainer) {
				containerHeight = tableContainer.getBoundingClientRect().height;
			}

			if (isH5) {
				// 确保是 Canvas 元素
				if (canvasEl instanceof HTMLCanvasElement) {
					console.log('元素是 Canvas');
				} else {
					console.warn('元素不是 Canvas，尝试查找内部的 Canvas');

					// 尝试在元素内部查找 Canvas
					const innerCanvas = canvasEl.querySelector('canvas');
					if (innerCanvas) {
						console.log('在元素内部找到 Canvas:', innerCanvas);
						canvasEl = innerCanvas;
					} else {
						console.error('元素内部也没有 Canvas');
						return;
					}
				}

				canvasCtx.value = canvasEl.getContext('2d');
				dpr.value = window.devicePixelRatio || 1;

				canvasSize.value = {
					w: window.innerWidth,
					h: containerHeight || window.innerHeight * 0.7
				};

				// 设置 Canvas 尺寸
				canvasEl.style.width = `${canvasSize.value.w}px`;
				canvasEl.style.height = `${canvasSize.value.h}px`;
				canvasEl.width = canvasSize.value.w * dpr.value;
				canvasEl.height = canvasSize.value.h * dpr.value;

				if (canvasCtx.value) {
					canvasCtx.value.scale(dpr.value, dpr.value);
				}

				// 初始化临时画布
				if (tempCanvasEl && tempCanvasEl instanceof HTMLCanvasElement) {
					tempCanvasCtx.value = tempCanvasEl.getContext('2d');
					tempCanvasEl.style.width = `${canvasSize.value.w}px`;
					tempCanvasEl.style.height = `${canvasSize.value.h}px`;
					tempCanvasEl.width = canvasSize.value.w * dpr.value;
					tempCanvasEl.height = canvasSize.value.h * dpr.value;
					if (tempCanvasCtx.value) {
						tempCanvasCtx.value.scale(dpr.value, dpr.value);
					}
				}
			} else {
				// 初始化主画布
				const query = uni.createSelectorQuery();
				const res = await new Promise(resolve => {
					query.select('.draw-canvas')
						.fields({
							node: true,
							size: true
						})
						.exec(rect => resolve(rect[0]));
				});

				if (!res || !res.node) {
					console.error('Canvas初始化失败');
					return;
				}

				const canvas = res.node;
				canvasCtx.value = canvas.getContext('2d');
				const systemInfo = uni.getSystemInfoSync();
				dpr.value = systemInfo.pixelRatio || 1;

				// 设置画布宽度为窗口宽度，高度为表格容器高度
				canvasSize.value = {
					w: systemInfo.windowWidth,
					h: containerHeight
				};

				canvasCtx.value.scale(dpr.value, dpr.value);

				// 初始化临时画布
				const tempRes = await new Promise(resolve => {
					query.select('.temp-canvas')
						.fields({
							node: true,
							size: true
						})
						.exec(rect => resolve(rect[0]));
				});

				if (tempRes && tempRes.node) {
					const tempCanvas = tempRes.node;
					tempCanvasCtx.value = tempCanvas.getContext('2d');
					tempCanvas.style.width = canvasSize.value.w + 'px';
					tempCanvas.style.height = canvasSize.value.h + 'px';
					tempCanvas.width = canvasSize.value.w * dpr.value;
					tempCanvas.height = canvasSize.value.h * dpr.value;
					tempCanvasCtx.value.scale(dpr.value, dpr.value);
				}
			}
			console.log('Canvas 初始化成功');
		} catch (error) {
			console.error('Canvas 初始化过程中发生错误:', error);
		}
	};

	// 在模块初始化时设置滚动监听（确保DOM已加载）
	nextTick().then(() => {
		setupTableScrollListener();
	});

	return {
		currentMode,
		isDrawing,
		isErasing,
		canvasPointerEvents,
		strokeColor,
		lineWidth,
		canvasCtx,
		tempCanvasCtx,
		canvasSize,
		dpr,
		currentShape,
		shapes,
		eraserSize,
		onCanvasStart,
		onCanvasMove,
		onCanvasEnd,
		redraw,
		initCanvas,
		checkPointOnNumber,
		isPointInNonDrawableArea,
		checkPointOnTextLabel,
		performErase,
		setupTableScrollListener // 暴露出去以便在需要时手动调用
	};
}