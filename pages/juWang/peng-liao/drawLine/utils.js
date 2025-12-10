// 计算曲线坐标
export const getCurvePoint = (x1, y1, x2, y2, distance) => {
  // 计算中点
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  // 计算向量 AB
  const dx = x2 - x1
  const dy = y2 - y1
  // 计算垂直向量
  const perpendicularDx = -dy
  const perpendicularDy = dx

  const length = Math.sqrt(perpendicularDx * perpendicularDx + perpendicularDy * perpendicularDy)
  const unitX = perpendicularDx / length
  const unitY = perpendicularDy / length
  // 计算两侧点坐标
  const point1 = {
    x: midX + unitX * distance,
    y: midY + unitY * distance
  }
  const point2 = {
    x: midX - unitX * distance,
    y: midY - unitY * distance
  }
  const offset1 = point1.x * 2 - midX
  const offset2 = point2.x * 2 - midX

  if (point1.y >= midY) {
    return [point2, point1, offset2, offset1]
  } else {
    return [point1, point2, offset1, offset2]
  }
}

// 格式化日期
export const getDate = (date) => {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  const day = new Date(date).getDay()
  return date.replace(/-/g, '/').slice(-5) + ' ' + week[day]
}

// 图片压缩
const TARGET_SIZE = 20 * 1024
export const getCompressImage = async (url, quality = 1) => {
  // #ifdef H5
  return new Promise((resolve) => {
    const image = new Image()
    image.src = url
    image.onload = async function () {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const drp = uni.getSystemInfoSync().devicePixelRatio
      canvas.width = image.width * drp
      canvas.height = image.height * drp
      context.drawImage(image, 0, 0, image.width * drp, image.height * drp)
      // 尺寸
      let size = 1
      while (true) {
        if (quality > 0.1) {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          const fileSize = await getFileSize(compressedDataUrl)
          quality -= 0.1
          if (fileSize < TARGET_SIZE) {
            resolve(compressedDataUrl)
            return
          }
        } else {
          size -= 0.1
          canvas.width = image.width * drp * size
          canvas.height = image.height * drp * size
          context.drawImage(image, 0, 0, image.width * drp * size, image.height * drp * size)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          const fileSize = await getFileSize(compressedDataUrl)
          if (fileSize < TARGET_SIZE) {
            resolve(compressedDataUrl)
            return
          }
        }
      }
    }
  })
  // #endif

  // #ifndef H5
  quality = quality * 100
  const compressImage = () => {
    return new Promise((resolve, reject) => {
      uni.compressImage({
        src: url,
        quality: quality,
        success: (res) => {
          resolve(res.tempFilePath)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }
  while (true) {
    const compressedImage = await compressImage()
    const size = await getFileSize(compressedImage)
    if (size < TARGET_SIZE) {
      return compressedImage
    } else {
      quality -= 10
    }
  }
  // #endif
}

// 获取文件大小
const getFileSize = async (path) => {
  return new Promise((resolve, reject) => {
    // App / 小程序
    if (uni.getFileInfo) {
      uni.getFileInfo({
        filePath: path,
        success(info) {
          resolve(info.size)
        },
        fail(err) {
          reject(err)
        }
      })
    } else {
      // H5
      fetch(path)
        .then((r) => r.blob())
        .then((b) => resolve(b.size))
        .catch((err) => reject(err))
    }
  })
}
