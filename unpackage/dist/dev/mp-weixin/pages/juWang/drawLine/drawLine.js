"use strict";
const common_vendor = require("../../../common/vendor.js");
const pages_juWang_drawLine_drawMethod = require("./drawMethod.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (Popup + _easycom_uni_icons + ColorSelect + ModeSelect)();
}
const Popup = () => "../../../components/juWang/Popup.js";
const ColorSelect = () => "../../../components/juWang/ColorSelect.js";
const ModeSelect = () => "../../../components/juWang/ModeSelect.js";
const _sfc_main = {
  __name: "drawLine",
  setup(__props) {
    common_vendor.useCssVars((_ctx) => ({
      "57de768a": systemInfo.value.safeArea.top,
      "7db759c6": containerPointerEvents.value,
      "1894f40a": color.value,
      "52457e50": textareaPosition.value.x + "px",
      "3ebe6db7": textareaPosition.value.y + "px",
      "17082f64": pointerEvents.value,
      "4463914f": curveLineY.value + "px",
      "46fb3720": curveLineX.value + "px"
    }));
    const weekMap = {
      0: "日",
      1: "一",
      2: "二",
      3: "三",
      4: "四",
      5: "五",
      6: "六"
    };
    const dateFromat = (dateStr) => {
      dateStr.split("-");
      const date = common_vendor.dayjs(dateStr).format("M/D");
      const dateArr2 = date.split("/");
      const dateStr2 = `${dateArr2[0]}/${dateArr2[1]} ${weekMap[common_vendor.dayjs(dateStr).format("d")]}`;
      return dateStr2;
    };
    const instance = common_vendor.getCurrentInstance();
    let ratio;
    let lineCtx;
    const popup = common_vendor.ref(null);
    const systemInfo = common_vendor.ref(common_vendor.index.getSystemInfoSync());
    const data = common_vendor.ref([]);
    let positionList;
    const getData = async () => {
      const res = await common_vendor.index.request({
        url: "http://caimi.s7.tunnelfrp.com/web/ticket/query?tname=排列五&page=1&limit=10"
      });
      data.value = res.data.data.records.reverse();
      data.value.forEach((item) => {
        item.number = item.number.split(" ").slice(0, 5);
      });
      await common_vendor.nextTick$1();
      const query = common_vendor.index.createSelectorQuery().in(instance.proxy);
      query.selectAll(".item").boundingClientRect((data2) => {
        positionList = data2;
      }).exec();
    };
    getData();
    const curveLineX = common_vendor.ref(0);
    const curveLineY = common_vendor.ref(0);
    const iscurveHandleShow = common_vendor.ref(false);
    const color = common_vendor.ref("#f2232b");
    const size = common_vendor.ref(3);
    let drawnStraightLine, drawnCurveLine, drawnTrack, drawSolidRect, drawHollowRect, drawSolidCircle, drawHollowCircle;
    const curveLine = (startX2, startY2, endX2, endY2) => {
      drawnStraightLine(startX2, startY2, endX2, endY2);
      curveLineX.value = (startX2 + endX2) / 2;
      curveLineY.value = (startY2 + endY2) / 2 - scrolltop;
    };
    const drawnLineAll = () => {
      record.value.forEach((item) => {
        if (!(item == null ? void 0 : item.line))
          return;
        const type = item.line.type;
        const color2 = item.style.color;
        const size2 = item.style.size;
        if (type === "straight") {
          const { startX: startX2, startY: startY2, endX: endX2, endY: endY2 } = item.line.position;
          drawnStraightLine(startX2, startY2, endX2, endY2, color2, size2);
        }
        if (type === "curve") {
          const { startX: startX2, startY: startY2, centerX, centerY, endX: endX2, endY: endY2 } = item.line.position;
          const center = startY2 / 2 + endY2 / 2;
          const y = (centerY - center) * 2 + center;
          drawnCurveLine(startX2, startY2, centerX, y, endX2, endY2, color2, size2);
        }
        if (type === "track") {
          const track2 = item.line.position;
          drawnTrack(track2, color2, size2);
        }
        if (type === "solidRect") {
          const { x, y, width, height } = item.line.position;
          drawSolidRect(x, y, width, height, color2);
        }
        if (type === "hollowRect") {
          const { x, y, width, height } = item.line.position;
          drawHollowRect(x, y, width, height, color2, size2);
        }
        if (type === "solidCircle") {
          const { startX: startX2, startY: startY2, endX: endX2, endY: endY2 } = item.line.position;
          drawSolidCircle(startX2, startY2, endX2, endY2, color2, size2);
        }
        if (type === "hollowCircle") {
          const { startX: startX2, startY: startY2, endX: endX2, endY: endY2 } = item.line.position;
          drawHollowCircle(startX2, startY2, endX2, endY2, color2, size2);
        }
      });
    };
    const record = common_vendor.ref([]);
    let startX, startY, endX, endY;
    const getPosition = (x, y) => {
      const result = positionList.find((item) => {
        return x < item.right && y < item.bottom;
      });
      return result;
    };
    const touchstart = (event, id) => {
      event.preventDefault();
      isScroll.value = false;
      iscurveHandleShow.value = false;
      const { clientX, clientY } = event.touches[0];
      const position = getPosition(clientX, clientY + scrolltop);
      startX = position.left + position.width / 2;
      startY = position.top + position.height / 2;
      record.value.push({ point: [position.id] });
    };
    const touchmove = (event) => {
      event.preventDefault();
      const { clientX, clientY } = event.touches[0];
      drawnLineAll();
      drawnStraightLine(startX, startY, clientX, clientY + scrolltop);
      lineCtx.draw();
    };
    const touchend = (event) => {
      isScroll.value = true;
      const { clientX, clientY } = event.changedTouches[0];
      const position = getPosition(clientX, clientY + scrolltop);
      endX = position.left + position.width / 2;
      endY = position.top + position.height / 2;
      drawnLineAll();
      const lastRecord = record.value[record.value.length - 1];
      lastRecord.style = { color: color.value, size: size.value };
      if (lastRecord.point[0] !== position.id) {
        lastRecord.point.push(position.id);
        lastRecord.line = { type: "straight", position: { startX, startY, endX, endY } };
        iscurveHandleShow.value = true;
        curveLine(startX, startY, endX, endY);
      } else {
        iscurveHandleShow.value = false;
      }
      lineCtx.draw();
    };
    const curveTouchstart = () => {
      const item = record.value[record.value.length - 1];
      item.line.type = "curve";
      const { startX: startX2, startY: startY2, endX: endX2, endY: endY2 } = item.line.position;
      item.line.position.centerX = startX2 / 2 + endX2 / 2;
      item.line.position.centerY = startY2 / 2 + endY2 / 2;
    };
    const curveTouchmove = (event) => {
      event.preventDefault();
      const { pageX, pageY } = event.touches[0];
      curveLineX.value = pageX;
      curveLineY.value = pageY;
      const item = record.value[record.value.length - 1];
      item.line.position.centerX = pageX;
      item.line.position.centerY = pageY + scrolltop;
      drawnLineAll();
      lineCtx.draw();
    };
    const pointActives = common_vendor.computed(() => {
      const result = {};
      record.value.forEach((item) => {
        if (!(item == null ? void 0 : item.point))
          return;
        item.point.forEach((id) => {
          var _a, _b;
          result[id] = { color: (_a = item.style) == null ? void 0 : _a.color, isSolid: (_b = item.marker) == null ? void 0 : _b.isSolid };
        });
      });
      return result;
    });
    const revoke = () => {
      iscurveHandleShow.value = false;
      record.value.pop();
      drawnLineAll();
      lineCtx.draw();
    };
    const trash = () => {
      iscurveHandleShow.value = false;
      record.value = [];
      drawnLineAll();
      lineCtx.draw();
    };
    const getRect = (id) => {
      return new Promise((resolve) => {
        const query = common_vendor.index.createSelectorQuery().in(instance.proxy);
        query.select(id).boundingClientRect((data2) => {
          resolve(data2);
        }).exec();
      });
    };
    common_vendor.onReady(async () => {
      lineCtx = common_vendor.index.createCanvasContext("lineCanvas");
      ratio = (await getRect(".container")).width / 750;
      ({
        drawnStraightLine,
        drawnCurveLine,
        drawnTrack,
        drawSolidRect,
        drawHollowRect,
        drawSolidCircle,
        drawHollowCircle
      } = new pages_juWang_drawLine_drawMethod.DrawShape(color, size, lineCtx));
    });
    const marks = common_vendor.computed(() => {
      const result = {};
      record.value.forEach((item) => {
        var _a, _b;
        const row = (_a = item.marker) == null ? void 0 : _a.row;
        const indexs = (_b = item.marker) == null ? void 0 : _b.indexs;
        if (row && indexs) {
          indexs.forEach((index) => {
            result[`${row}-${index}`] = { marker: item.marker, style: item.style };
          });
        }
      });
      return result;
    });
    const popupSbumit = (val) => {
      const item = record.value[record.value.length - 1];
      item.marker = val;
      item.marker.row = +item.point[item.point.length - 1][0];
    };
    let scrolltop = 0;
    const isScroll = common_vendor.ref(true);
    const scroll = (event) => {
      scrolltop = event.detail.scrollTop;
      curveLineY.value += event.detail.deltaY;
    };
    const spaceTouchend = (event) => {
      touchend(event);
      const item = record.value[record.value.length - 1];
      if (item.point[item.point.length - 1].endsWith("0")) {
        popup.value.openRefernumber();
      } else if (item.point[item.point.length - 1].endsWith("5")) {
        popup.value.openSimple();
      } else {
        popup.value.open(item.point[item.point.length - 1][1] - 1);
      }
    };
    const getColorStyle = (id) => {
      const meta = marks.value[id];
      if (id.endsWith("5")) {
        return {
          backgroundColor: meta.style.color
        };
      }
      return {
        backgroundColor: meta.marker.isSolid ? meta.style.color : "#fff",
        border: meta.marker.isSolid ? void 0 : `5rpx solid ${meta.style.color}`,
        color: meta.marker.isSolid ? "#fefdf8" : meta.style.color
      };
    };
    const mode = common_vendor.ref("智能曲线");
    const pointerEvents = common_vendor.ref("auto");
    common_vendor.watch(mode, (val) => {
      if (val === "智能曲线") {
        pointerEvents.value = "auto";
      } else {
        pointerEvents.value = "none";
      }
    });
    let track = [];
    let straightLine = {};
    let rect = {};
    let circle = {};
    const isTextInputShow = common_vendor.ref(false);
    const textareaPosition = common_vendor.ref({});
    let textPosition = {};
    const textareaValue = common_vendor.ref("");
    const textList = common_vendor.computed(() => {
      const result = [];
      for (let i = 0; i < record.value.length; i++) {
        const item = record.value[i];
        if (item.text) {
          result.push({ text: item.text, style: item.style, isSolid: item.isSolid, index: i });
        }
      }
      return result;
    });
    const textStyle = (index) => {
      const meta = textList.value[index];
      return {
        backgroundColor: meta.isSolid ? meta.style.color : "transparent",
        color: meta.isSolid ? "#fff" : meta.style.color
      };
    };
    const canvasTouchStart = (event) => {
      let { x, y } = event.touches[0];
      if (x < 250 * ratio) {
        isScroll.value = true;
        return;
      } else {
        isScroll.value = false;
      }
      switch (mode.value) {
        case "自由线":
          track = [];
          track.push({ x, y });
          break;
        case "直线":
          straightLine = {
            startX: x,
            startY: y
          };
          break;
        case "添加文字":
          if (!isTextInputShow.value) {
            textPosition = { x, y };
            if (x > (750 - 300) * ratio)
              x = (750 - 300) * ratio;
            if (y < 200 * ratio)
              y = 200 * ratio;
            if (y > 1e3 * ratio)
              y = 1e3 * ratio;
            textareaPosition.value = { x, y };
            isTextInputShow.value = true;
          } else {
            isTextInputShow.value = false;
            if (textChangeIndex !== null) {
              const meta = textList.value[textChangeIndex];
              meta.text.content = textareaValue.value;
              meta.style.width = "auto";
              meta.style.height = "auto";
              common_vendor.nextTick$1(async () => {
                const { width, height } = await getRect(`#text${textChangeIndex}`);
                meta.style.width = width;
                meta.style.height = height;
                textChangeIndex = null;
                textareaValue.value = "";
              });
              return;
            }
            if (!textareaValue.value)
              return;
            record.value.push({
              text: {
                content: textareaValue.value,
                position: textPosition
              },
              style: {
                color: color.value,
                // width: 0,
                // height: 0,
                fontSize: 20
              },
              isSolid: true
            });
            textareaValue.value = "";
            common_vendor.nextTick$1(async () => {
              common_vendor.index.createSelectorQuery().in(instance.proxy);
              const { width, height } = await getRect(`#text${record.value.length - 1}`);
              const item = record.value[record.value.length - 1];
              item.style.width = width;
              item.style.height = height;
            });
          }
          break;
        case "实心方框":
        case "空心方框":
          rect = {};
          rect = {
            x,
            y
          };
          break;
        case "实心圆框":
        case "空心圆框":
          circle = {
            startX: x,
            startY: y
          };
          break;
      }
    };
    const canvasTouchMove = (event) => {
      if (isScroll.value)
        return;
      const { x, y } = event.touches[0];
      drawnLineAll();
      switch (mode.value) {
        case "自由线":
          track.push({ x, y });
          drawnTrack(track);
          break;
        case "直线":
          drawnStraightLine(straightLine.startX, straightLine.startY, x, y);
          straightLine.endX = x;
          straightLine.endY = y;
          break;
        case "添加文字":
          break;
        case "实心方框":
        case "空心方框":
          rect.width = x - rect.x;
          rect.height = y - rect.y;
          if (mode.value === "实心方框") {
            drawSolidRect(rect.x, rect.y, rect.width, rect.height);
          } else {
            drawHollowRect(rect.x, rect.y, rect.width, rect.height);
          }
          break;
        case "实心圆框":
        case "空心圆框":
          circle.endX = x;
          circle.endY = y;
          if (mode.value === "实心圆框") {
            drawSolidCircle(circle.startX, circle.startY, circle.endX, circle.endY);
          } else {
            drawHollowCircle(circle.startX, circle.startY, circle.endX, circle.endY);
          }
          break;
      }
      lineCtx.draw();
    };
    const canvasTouchEnd = (event) => {
      if (isScroll.value)
        return;
      switch (mode.value) {
        case "自由线":
          record.value.push({
            line: {
              type: "track",
              position: track
            },
            style: { color: color.value, size: size.value }
          });
          track = [];
          break;
        case "直线":
          record.value.push({
            line: {
              type: "straight",
              position: straightLine
            },
            style: { color: color.value, size: size.value }
          });
          straightLine = {};
          break;
        case "添加文字":
          break;
        case "实心方框":
          record.value.push({
            line: {
              type: "solidRect",
              position: rect
            },
            style: { color: color.value }
          });
          rect = {};
          break;
        case "空心方框":
          record.value.push({
            line: {
              type: "hollowRect",
              position: rect
            },
            style: { color: color.value, size: size.value }
          });
          break;
        case "实心圆框":
          record.value.push({
            line: {
              type: "solidCircle",
              position: circle
            },
            style: { color: color.value, size: size.value }
          });
          break;
        case "空心圆框":
          record.value.push({
            line: {
              type: "hollowCircle",
              position: circle
            },
            style: { color: color.value, size: size.value }
          });
          break;
      }
    };
    let textStartX, textStartY;
    let tmpTextWidth, tmpTextHeight;
    const changeTextFontSize = (index) => {
      const item = textList.value[index];
      const style = item.style;
      const contentLength = item.text.content.length;
      let row = 1;
      while (true) {
        const fs = style.height / row;
        const cloumn = Math.floor(style.width / (fs * 0.6));
        if (row * cloumn >= contentLength) {
          if (fs > 80) {
            style.fontSize = 80;
            return;
          } else {
            style.fontSize = fs;
            return;
          }
        }
        row++;
        if (row > 10)
          return;
      }
    };
    const textTouchstart = (e) => {
      isScroll.value = false;
      const { pageX, pageY } = e.touches[0];
      textStartX = pageX;
      textStartY = pageY;
      const { width, height } = textList.value[textList.value.length - 1].style;
      tmpTextWidth = width;
      tmpTextHeight = height;
    };
    const textTouchmove = (e, index) => {
      const { pageX, pageY } = e.touches[0];
      const changeWidth = pageX - textStartX;
      const changeHeight = pageY - textStartY;
      const item = textList.value[index];
      if (item.style.fontSize < 20 && (changeWidth < 0 || changeHeight < 0))
        return;
      item.style.width = changeWidth + tmpTextWidth;
      item.style.height = changeHeight + tmpTextHeight;
      changeTextFontSize(index);
    };
    const textTouchend = async (e, index) => {
      const { width, height } = await getRect(`#text${index}`);
      const item = textList.value[index];
      item.style.width = width;
      item.style.height = height;
      isScroll.value = true;
      isTextClick = true;
    };
    const changeTextSolid = (index) => {
      record.value[index].isSolid = !record.value[index].isSolid;
    };
    let tmpTextX, tmpTextY;
    let isTextClick = true;
    const textPositionStart = (e, index) => {
      isScroll.value = false;
      const { pageX, pageY } = e.touches[0];
      textStartX = pageX;
      textStartY = pageY;
      const { x, y } = record.value[index].text.position;
      tmpTextX = x;
      tmpTextY = y;
    };
    const textPositionMove = (e, index) => {
      isTextClick = false;
      const { pageX, pageY } = e.touches[0];
      const item = record.value[index];
      item.text.position.x = pageX - textStartX + tmpTextX;
      item.text.position.y = pageY - textStartY + tmpTextY;
    };
    let textChangeIndex = null;
    const cursor = common_vendor.ref(0);
    const textPositionEnd = (e, index) => {
      if (isTextClick) {
        isTextInputShow.value = true;
        textChangeIndex = index;
        textareaValue.value = record.value[index].text.content;
        const { pageX: x, pageY: y } = e.changedTouches[0];
        textareaPosition.value = { x, y };
        cursor.value = record.value[index].text.content.length;
        return;
      }
      isTextClick = true;
      isScroll.value = true;
    };
    const isModeSelectShow = common_vendor.ref(true);
    const isColorSelectShow = common_vendor.ref(true);
    const isLockShow = common_vendor.ref(true);
    const containerPointerEvents = common_vendor.ref("auto");
    const lock = () => {
      isModeSelectShow.value = !isModeSelectShow.value;
      isColorSelectShow.value = !isColorSelectShow.value;
      containerPointerEvents.value = isLockShow.value ? "none" : "auto";
    };
    const changeColor = () => {
      isModeSelectShow.value = !isModeSelectShow.value;
      isLockShow.value = !isLockShow.value;
    };
    const changeMode = () => {
      isColorSelectShow.value = !isColorSelectShow.value;
      isLockShow.value = !isLockShow.value;
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.sr(popup, "233ee3e6-0", {
          "k": "popup"
        }),
        b: common_vendor.o(popupSbumit),
        c: common_vendor.p({
          type: "left",
          size: "20",
          color: "#fff"
        }),
        d: common_vendor.p({
          type: "undo",
          size: "20",
          color: "#fff"
        }),
        e: common_vendor.o(revoke),
        f: common_vendor.p({
          type: "trash",
          size: "20",
          color: "#fff"
        }),
        g: common_vendor.o(trash),
        h: common_vendor.p({
          type: "redo",
          size: "20",
          color: "#fff"
        }),
        i: common_vendor.p({
          type: "download",
          size: "20",
          color: "#fff"
        }),
        j: common_vendor.p({
          type: "settings",
          size: "20",
          color: "#fff"
        }),
        k: data.value
      }, data.value ? common_vendor.e({
        l: common_vendor.o(canvasTouchStart),
        m: common_vendor.o(canvasTouchMove),
        n: common_vendor.o(canvasTouchEnd),
        o: common_vendor.f(data.value, (item, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(item.issueno),
            b: common_vendor.t(dateFromat(item.opendate)),
            c: common_vendor.t(item.number.reduce((a, b) => Number(a) + Number(b), 0)),
            d: pointActives.value[item.id + 0] ? 1 : "",
            e: ((_a = pointActives.value[item.id + 0]) == null ? void 0 : _a.color) || "",
            f: item.id + 0,
            g: common_vendor.o(($event) => touchstart($event, item.id + 0), item.id),
            h: common_vendor.f(item.number, (number, index, i1) => {
              var _a2;
              return {
                a: common_vendor.t(number),
                b: pointActives.value[item.id + (index + 1)] ? 1 : "",
                c: ((_a2 = pointActives.value[item.id + (index + 1)]) == null ? void 0 : _a2.color) || "",
                d: item.id + (index + 1),
                e: common_vendor.o(($event) => touchstart($event, item.id + (index + 1)), index),
                f: index
              };
            }),
            i: item.id,
            j: common_vendor.o(touchmove, item.id),
            k: common_vendor.o(touchend, item.id)
          };
        }),
        p: common_vendor.f(6, (row, k0, i0) => {
          return common_vendor.e({
            a: marks.value[`${row}-0`]
          }, marks.value[`${row}-0`] ? {
            b: common_vendor.t(marks.value[`${row}-0`].marker.condition),
            c: common_vendor.t(marks.value[`${row}-0`].marker.numbers.join("")),
            d: marks.value[`${row}-0`].style.color || ""
          } : {
            e: pointActives.value[`${row}0`] ? 1 : "",
            f: `${row}0`,
            g: common_vendor.o(($event) => touchstart($event), row)
          }, {
            h: common_vendor.f(5, (val, index, i1) => {
              var _a;
              return common_vendor.e({
                a: marks.value[`${row}-${index + 1}`]
              }, marks.value[`${row}-${index + 1}`] ? {
                b: common_vendor.t(marks.value[`${row}-${index + 1}`].marker.condition),
                c: common_vendor.t(marks.value[`${row}-${index + 1}`].marker.numbers.join("")),
                d: index !== 4 ? 1 : "",
                e: index === 4 ? 1 : "",
                f: common_vendor.s(getColorStyle(`${row}-${index + 1}`))
              } : {
                g: pointActives.value[`${row}${index + 1}`] ? 1 : "",
                h: ((_a = pointActives.value[`${row}${index + 1}`]) == null ? void 0 : _a.color) || "",
                i: `${row}${index + 1}`,
                j: common_vendor.o(($event) => touchstart($event), val)
              }, {
                k: val
              });
            }),
            i: row,
            j: common_vendor.o(touchmove, row),
            k: common_vendor.o(spaceTouchend, row)
          });
        }),
        q: common_vendor.f(textList.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.text.content),
            b: `text${index}`,
            c: item.style.width === "auto" ? "auto" : item.style.width + "px",
            d: item.style.height === "auto" ? "auto" : item.style.height + "px",
            e: common_vendor.s(textStyle(index)),
            f: common_vendor.o(($event) => textPositionStart($event, index), index),
            g: common_vendor.o(($event) => textPositionMove($event, index), index),
            h: common_vendor.o(($event) => textPositionEnd($event, index), index),
            i: item.style.color,
            j: common_vendor.o(($event) => changeTextSolid(item.index), index),
            k: item.style.color,
            l: common_vendor.o(($event) => textTouchstart($event), index),
            m: common_vendor.o(($event) => textTouchmove($event, index), index),
            n: common_vendor.o(($event) => textTouchend($event, index), index),
            o: index,
            p: item.text.position.y - 100 * common_vendor.unref(ratio) + "px",
            q: item.text.position.x + "px",
            r: item.style.fontSize + "px",
            s: item.style.fontSize + "px",
            t: item.style.color
          };
        }),
        r: isTextInputShow.value
      }, isTextInputShow.value ? {
        s: cursor.value,
        t: textareaValue.value,
        v: common_vendor.o(($event) => textareaValue.value = $event.detail.value)
      } : {}) : {}, {
        w: common_vendor.o(scroll),
        x: isScroll.value,
        y: common_vendor.o(curveTouchstart),
        z: common_vendor.o(curveTouchmove),
        A: iscurveHandleShow.value,
        B: common_vendor.p({
          type: "closeempty",
          size: "20",
          color: "red"
        }),
        C: isColorSelectShow.value,
        D: common_vendor.o(changeColor),
        E: common_vendor.o(($event) => color.value = $event),
        F: common_vendor.o(($event) => size.value = $event),
        G: common_vendor.p({
          color: color.value,
          size: size.value
        }),
        H: isModeSelectShow.value,
        I: common_vendor.o(changeMode),
        J: common_vendor.o(($event) => mode.value = $event),
        K: common_vendor.p({
          modelValue: mode.value
        }),
        L: common_vendor.p({
          type: "locked-filled",
          size: "30",
          color: "#fff"
        }),
        M: common_vendor.o(lock),
        N: isLockShow.value,
        O: common_vendor.s(_ctx.__cssVars())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-233ee3e6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/drawLine.js.map
