## 1.0.0（2026-04-28）
- Android / iOS 双端实装 14 个 API（`executeFFmpeg` / `executeFFprobe` / `getMediaInfo` / `extractAudio` / `compressVideo` / `generateThumbnail` / `trimMedia` / `mergeAV` / `mixAudio` / `convertFormat` / `cancelFFmpeg` / `cancelAllFFmpeg` / `getSessions` / `getRealPath`）
- 实时 progress 回调（每帧触发，含 8 字段实时统计）
- 完整 log 回调（ffmpeg stderr 日志逐条推送）
- 媒体信息结构化解析（含 video / audio / data 流分类，自动跳过未知流类型）
- iOS 端裁剪命令自动附 `+faststart / make_zero / reset_timestamps` 优化 AVPlayer 兼容性
- 错误码统一（`UniError` 标准格式，含 `errSubject / errCode / errMsg`）
