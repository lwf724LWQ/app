"use strict";
const common_vendor = require("../../../../common/vendor.js");
function useScreenshot(html2canvas) {
  const saveCanvasImage = async () => {
    common_vendor.index.showLoading({ title: "正在生成截图...", mask: true });
    try {
      const container = document.querySelector(".numbers-table-container");
      if (!container) {
        throw new Error("未找到表格容器");
      }
      const canvas = await html2canvas(container, {
        scale: window.devicePixelRatio || 1,
        // 保持高清
        useCORS: true,
        logging: false,
        backgroundColor: null,
        // 透明背景
        ignoreElements: (element) => {
          return element.classList.contains("fab-wrapper");
        }
      });
      canvas.toBlob(async (blob) => {
        try {
          const url = URL.createObjectURL(blob);
          const timestamp = (/* @__PURE__ */ new Date()).getTime();
          const fileName = `table-canvas-${timestamp}.png`;
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "保存成功", icon: "none" });
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useScreenshot.js:51", "创建下载链接失败:", error);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "保存失败", icon: "none" });
        }
      }, "image/png");
    } catch (err) {
      common_vendor.index.__f__("error", "at pages/juWang/drawLine/useFunc/useScreenshot.js:57", "截图失败:", err);
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({ title: "截图失败，请重试", icon: "none" });
    }
  };
  const domToImage = (dom) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const rect = dom.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const tempImg = new Image();
      const svg = `
        <svg width="${rect.width}" height="${rect.height}" xmlns="http://www.w3.org/2000/svg">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${new XMLSerializer().serializeToString(dom)}</div>
          </foreignObject>
        </svg>
      `;
      const svgData = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
      tempImg.crossOrigin = "anonymous";
      tempImg.onload = () => {
        try {
          ctx.drawImage(tempImg, 0, 0);
          const cleanCanvas = document.createElement("canvas");
          const cleanCtx = cleanCanvas.getContext("2d");
          cleanCanvas.width = rect.width;
          cleanCanvas.height = rect.height;
          cleanCtx.drawImage(canvas, 0, 0);
          resolve(cleanCanvas);
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(svgData);
        }
      };
      tempImg.onerror = (error) => {
        reject(new Error("无法加载图像: " + error.message));
      };
      tempImg.src = svgData;
    });
  };
  return {
    saveCanvasImage,
    domToImage
  };
}
exports.useScreenshot = useScreenshot;
//# sourceMappingURL=../../../../../.sourcemap/mp-weixin/pages/juWang/drawLine/useFunc/useScreenshot.js.map
