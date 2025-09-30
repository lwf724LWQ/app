export default function useScreenshot(html2canvas) {
    // 保存 Canvas 和表格内容 - 使用html2canvas实现
    const saveCanvasImage = async () => {
        // 显示加载提示
        uni.showLoading({ title: '正在生成截图...', mask: true });

        try {
            // 获取表格容器元素
            const container = document.querySelector('.numbers-table-container');
            if (!container) {
                throw new Error('未找到表格容器');
            }

            // 使用html2canvas捕获整个表格容器，包括表格、Canvas和文字标注
            const canvas = await html2canvas(container, {
                scale: window.devicePixelRatio || 1, // 保持高清
                useCORS: true,
                logging: false,
                backgroundColor: null, // 透明背景
                ignoreElements: (element) => {
                    // 忽略Fab按钮组，避免截图包含操作按钮
                    return element.classList.contains('fab-wrapper');
                }
            });

            // 将Canvas转换为图片
            canvas.toBlob(async (blob) => {
                try {
                    // 创建下载链接
                    const url = URL.createObjectURL(blob);
                    const timestamp = new Date().getTime();
                    const fileName = `table-canvas-${timestamp}.png`;

                    // 处理H5环境下载
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();

                    // 清理
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    }, 100);

                    uni.hideLoading();
                    uni.showToast({ title: '保存成功', icon: 'none' });
                } catch (error) {
                    console.error('创建下载链接失败:', error);
                    uni.hideLoading();
                    uni.showToast({ title: '保存失败', icon: 'none' });
                }
            }, 'image/png');
        } catch (err) {
            console.error('截图失败:', err);
            uni.hideLoading();
            uni.showToast({ title: '截图失败，请重试', icon: 'none' });
        }
    };

    // 将DOM元素转换为图片 - 修复版
    const domToImage = (dom) => {
        return new Promise((resolve, reject) => {
            // 创建一个临时Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 获取DOM元素的尺寸
            const rect = dom.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            // 创建一个临时img元素
            const tempImg = new Image();

            // 创建SVG，使用base64编码避免跨域问题
            const svg = `
        <svg width="${rect.width}" height="${rect.height}" xmlns="http://www.w3.org/2000/svg">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${new XMLSerializer().serializeToString(dom)}</div>
          </foreignObject>
        </svg>
      `;

            // 将SVG转换为data URL
            const svgData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));

            // 关键：允许跨域使用图像，但这会污染Canvas
            // 所以我们需要另一种方式处理
            tempImg.crossOrigin = 'anonymous';

            tempImg.onload = () => {
                try {
                    // 绘制图像到Canvas
                    ctx.drawImage(tempImg, 0, 0);

                    // 创建第二个Canvas用于净化
                    const cleanCanvas = document.createElement('canvas');
                    const cleanCtx = cleanCanvas.getContext('2d');
                    cleanCanvas.width = rect.width;
                    cleanCanvas.height = rect.height;

                    // 将第一个Canvas的内容绘制到第二个Canvas，净化处理
                    cleanCtx.drawImage(canvas, 0, 0);

                    resolve(cleanCanvas);
                } catch (error) {
                    reject(error);
                } finally {
                    // 清理
                    URL.revokeObjectURL(svgData);
                }
            };

            tempImg.onerror = (error) => {
                reject(new Error('无法加载图像: ' + error.message));
            };

            tempImg.src = svgData;
        });
    };

    return {
        saveCanvasImage,
        domToImage
    };
}