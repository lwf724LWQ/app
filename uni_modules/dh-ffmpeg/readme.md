# dh-ffmpeg

[![uni-app](https://img.shields.io/badge/uni--app-blue)](https://uniapp.dcloud.net.cn/)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey)](https://github.com)

基于 FFmpegKit 封装的 uni-app / uni-app x 原生多媒体处理插件。**双端 14 个 API 全部实装、含实时进度回调、含完整 ffprobe 媒体信息解析**。

---

## 适用场景

App 端常见的音视频处理需求几乎全覆盖。以下列出主流场景与对应实现方式（具体命令示例参见各 API 章节或 [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)）：

| 场景                                                 | 实现方式                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| 🎬 **短视频压缩 / 转码**（H.264 / H.265）            | `compressVideo`（默认走系统硬编 mediacodec / videotoolbox）  |
| ✂️ **视频 / 音频裁剪**（精确切片）                   | `trimMedia`（流复制秒裁，或重编码精确到帧）                  |
| 🎵 **提取视频中的音频** / 提取背景音乐               | `extractAudio`（输出 m4a / aac，可指定码率 / 采样率 / 声道） |
| 🖼 **视频封面截图** / 关键帧抽取                     | `generateThumbnail`                                          |
| 🔍 **媒体元数据查询**（时长 / 分辨率 / 帧率 / 码率） | `getMediaInfo`（结构化解析 video / audio 流）                |
| 🔄 **格式转换**（MP4 ⇄ MOV ⇄ M4A）                   | `convertFormat`                                              |
| 💧 **去水印** / 去 logo                              | `executeFFmpeg` + `-vf "delogo=x=:y=:w=:h="`                 |
| 🏷 **加图片 / 文字水印**                             | `executeFFmpeg` + `overlay` / `drawtext` filter              |
| 📚 **视频拼接** / 多段合成                           | `executeFFmpeg` + `concat` demuxer                           |
| 🎞 **视频转 GIF** / GIF 调色板优化                   | `executeFFmpeg`（`palettegen` + `paletteuse`）               |
| 🎙 **音频降噪 / 变速 / 变调**                        | `executeFFmpeg` + `afftdn` / `atempo` / `asetrate` filter    |
| 🔊 **音频淡入淡出**                                  | `executeFFmpeg` + `afade` filter                             |
| 🌗 **视频亮度 / 对比度 / 饱和度调整**                | `executeFFmpeg` + `eq` / `colorchannelmixer` filter          |
| ↺ **视频旋转 / 镜像 / 翻转**                         | `executeFFmpeg` + `transpose` / `hflip` / `vflip`            |

> 💡 **`executeFFmpeg` 是后门**：上面所有 ffmpeg 能做的事都可以用 `executeFFmpeg` 自己拼命令实现，无需等插件 API 升级。

---

## 快速开始

```ts
import {
  extractAudio,
  compressVideo,
  generateThumbnail,
  trimMedia,
  mergeAV,
  mixAudio,
  convertFormat,
  executeFFmpeg,
  getMediaInfo,
} from '@/uni_modules/dh-ffmpeg';
```

---

## API

所有函数均采用 Options 对象风格，回调遵循 uni-app 规范（`success` / `fail` / `complete`）。

### executeFFmpeg(options)

执行任意 FFmpeg 命令。

| 参数     | 类型                            | 必填 | 说明                              |
| -------- | ------------------------------- | ---- | --------------------------------- |
| cmd      | string                          | 是   | FFmpeg 命令（不含 `ffmpeg` 前缀） |
| start    | (sessionId: number) => void     | 否   | 任务开始回调                      |
| progress | (stats: FFmpegProgress) => void | 否   | 进度回调                          |
| log      | (entry: FFmpegLogEntry) => void | 否   | 日志回调                          |
| success  | (res: FFmpegSession) => void    | 否   | 成功回调                          |
| fail     | (err: UniError) => void         | 否   | 失败回调                          |
| complete | () => void                      | 否   | 完成回调（成功或失败后均触发）    |

```ts
executeFFmpeg({
  cmd: '-i /path/input.mp4 -c:v copy /path/output.mp4',
  progress: (stats) => {
    console.log('已处理', stats.time, 'ms');
  },
  success: (res) => {
    console.log('完成, 耗时', res.duration, 'ms');
  },
  fail: (err) => {
    console.log('失败', err.errCode, err.errMsg);
  },
});
```

> 💡 想把 `progress` 的 `stats.time` 转换成实际百分比？参见 [FFmpegProgress · 百分比进度换算](#ffmpegprogress)。

---

### executeFFprobe(options)

执行任意 FFprobe 命令。

| 参数            | 类型                            | 必填 | 说明         |
| --------------- | ------------------------------- | ---- | ------------ |
| cmd             | string                          | 是   | FFprobe 命令 |
| log             | (entry: FFmpegLogEntry) => void | 否   | 日志回调     |
| success         | (res: FFmpegSession) => void    | 否   | 成功回调     |
| fail / complete | —                               | 否   | 同上         |

> **注意**：执行 ffprobe 的 JSON 数据输出（如 `-print_format json`）会通过 `res.output` 字段返回（success 回调）。例如：
>
> ```ts
> executeFFprobe({
>   cmd: '-v error -print_format json -show_format -show_streams /path/video.mp4',
>   success: (res) => {
>     const probe = JSON.parse(res.output); // ffprobe JSON
>     console.log(probe.format.duration);
>   },
> });
> ```

---

### getMediaInfo(options)

获取媒体文件的结构化信息（时长、分辨率、码率等）。

| 参数            | 类型                            | 必填 | 说明               |
| --------------- | ------------------------------- | ---- | ------------------ |
| path            | string                          | 是   | 媒体文件路径       |
| timeout         | number                          | 否   | 超时 ms，默认 5000 |
| success         | (info: MediaInfoResult) => void | 否   | 成功回调           |
| fail / complete | —                               | 否   | 同上               |

```ts
getMediaInfo({
  path: '/path/video.mp4',
  success: (info) => {
    console.log('时长', info.duration, '秒');
    console.log('分辨率', info.videoStreams[0]?.width, 'x', info.videoStreams[0]?.height);
    console.log('音频', info.audioStreams[0]?.codec);
  },
});
```

**MediaInfoResult 结构：**

```ts
type MediaInfoResult = {
  filename: string; // 文件路径
  format: string; // 智能解析后的容器格式（按文件扩展名匹配），如 "mp4"、"mov"、"flac"
  formatRaw: string; // ffprobe 原始 demuxer 名（如 "mov,mp4,m4a,3gp,3g2,mj2"）
  duration: number; // 时长（秒）
  bitrate: number; // 总码率（bits/s），无值时 0
  size: number; // 文件大小（bytes）
  videoStreams: VideoStreamInfo[];
  audioStreams: AudioStreamInfo[];
  rawData: UTSJSONObject; // FFprobe 原始 JSON
};

type VideoStreamInfo = {
  index: number;
  codec: string; // "h264"、"hevc" 等
  width: number;
  height: number;
  fps: number; // 解析后的帧率，如 30、29.97
  fpsRaw: string; // 原始分数字符串，如 "30/1"
  bitrate: number; // bits/s，无值时 0
  duration: number; // 秒
};

type AudioStreamInfo = {
  index: number;
  codec: string; // "aac"、"mp3" 等
  sampleRate: number; // 采样率 Hz，如 44100
  channels: number;
  channelLayout: string; // "stereo"、"mono" 等
  bitrate: number; // bits/s，无值时 0
  duration: number;
};
```

---

### extractAudio(options)

从视频中提取音频。

| 参数       | 类型   | 默认值 | 说明                              |
| ---------- | ------ | ------ | --------------------------------- |
| inputPath  | string | —      | 输入视频路径                      |
| outputPath | string | —      | 输出音频路径（.mp3/.aac/.m4a 等） |
| bitrate    | string | 原始   | 音频码率，如 `"128k"`             |
| sampleRate | number | 原始   | 采样率，如 `44100`                |
| channels   | number | 原始   | 声道数，`1`=单声道，`2`=立体声    |
| startTime  | string | —      | 起始时间，`"HH:MM:SS"` 或秒数     |
| duration   | string | —      | 提取时长                          |

```ts
extractAudio({
  inputPath: '/path/video.mp4',
  outputPath: '/path/audio.m4a',
  bitrate: '128k',
  success: (res) => console.log('提取完成'),
});
```

---

### mergeAV(options)

将独立音频合并到视频（替换原音轨）。

| 参数       | 类型    | 默认值   | 说明               |
| ---------- | ------- | -------- | ------------------ |
| videoPath  | string  | —        | 输入视频路径       |
| audioPath  | string  | —        | 输入音频路径       |
| outputPath | string  | —        | 输出路径           |
| videoCodec | string  | `"copy"` | 视频编码           |
| audioCodec | string  | `"copy"` | 音频编码           |
| shortest   | boolean | `true`   | 以时长较短的流为准 |

```ts
mergeAV({
  videoPath: '/path/video.mp4',
  audioPath: '/path/bgm.m4a',
  outputPath: '/path/output.mp4',
  shortest: true,
  success: (res) => console.log('合并完成'),
});
```

---

### mixAudio(options)

将两路音频混合为一路（双音轨叠加）。

| 参数       | 类型   | 默认值   | 说明               |
| ---------- | ------ | -------- | ------------------ |
| inputPath1 | string | —        | 第一路音频路径     |
| inputPath2 | string | —        | 第二路音频路径     |
| outputPath | string | —        | 输出路径           |
| volume1    | number | `1.0`    | 音轨1音量，0.0~2.0 |
| volume2    | number | `1.0`    | 音轨2音量，0.0~2.0 |
| bitrate    | string | `"128k"` | 输出码率           |

```ts
mixAudio({
  inputPath1: '/path/voice.m4a',
  inputPath2: '/path/bgm.m4a',
  outputPath: '/path/mixed.m4a',
  volume1: 1.0,
  volume2: 0.3,
  success: (res) => console.log('混音完成'),
});
```

---

### compressVideo(options)

视频压缩/转码。**默认走系统硬件 H.264 编码**（Android `h264_mediacodec`，iOS `h264_videotoolbox`），可通过 `videoCodec` 参数切换软编或其他 codec。

| 参数           | 类型   | 默认值        | 说明                                                                                                           |
| -------------- | ------ | ------------- | -------------------------------------------------------------------------------------------------------------- |
| inputPath      | string | —             | 输入视频路径                                                                                                   |
| outputPath     | string | —             | 输出路径                                                                                                       |
| **videoCodec** | string | 系统硬编      | 见下方"可用编码器"                                                                                             |
| resolution     | string | 原始          | `"360p"/"480p"/"720p"/"1080p"` 或 `"1280x720"`                                                                 |
| videoBitrate   | string | —             | 视频码率，如 `"1000k"`。任何 codec 都可用，设置后覆盖 CRF                                                      |
| audioBitrate   | string | —             | 音频码率，如 `"128k"`                                                                                          |
| fps            | number | 原始          | 输出帧率                                                                                                       |
| crf            | number | `23`          | 质量因子 18~28，越小质量越好（**仅软编 libx264/libopenh264 真生效**；硬编下按区间映射成 4M/2M/1.2M/0.8M 码率） |
| preset         | string | `"ultrafast"` | `ultrafast/veryfast/fast/medium/slow`（**仅 libx264 生效**）                                                   |

#### 可用编码器（按 ffmpeg-kit 变体）

| videoCodec                       | 协议       | 速度   | 画质 | 哪些变体支持                          |
| -------------------------------- | ---------- | ------ | ---- | ------------------------------------- |
| `h264_mediacodec` (默认 Android) | 系统       | ⚡⚡⚡ | 中等 | **全部**（min/tls/lts/full/full-gpl） |
| `h264_videotoolbox` (默认 iOS)   | 系统       | ⚡⚡⚡ | 中等 | iOS 自带                              |
| `libopenh264`                    | LGPL (BSD) | ⚡⚡   | 良   | full、full-gpl                        |
| `libx264`                        | **GPL**    | ⚡     | 优   | lts、full-gpl                         |
| `libkvazaar` (H.265)             | LGPL       | ⚡     | 良   | full、full-gpl                        |
| `libx265` (H.265)                | **GPL**    | ⚡     | 优   | lts、full-gpl                         |

```ts
// 默认硬件编码（推荐）
compressVideo({
  inputPath: '/path/original.mp4',
  outputPath: '/path/compressed.mp4',
  resolution: '720p',
  crf: 26,
  success: (res) => console.log('压缩完成'),
});

// 切到 LGPL 软编（依赖 lts-full-16kb 及以上变体）
compressVideo({
  inputPath: '...',
  outputPath: '...',
  videoCodec: 'libopenh264',
  crf: 23,
  success: (res) => console.log('OpenH264 压缩完成'),
});

// 切到 H.265 (HEVC)，体积更小
compressVideo({
  inputPath: '...',
  outputPath: '....hevc.mp4',
  videoCodec: 'libkvazaar',
  videoBitrate: '800k',
  success: (res) => console.log('HEVC 压缩完成'),
});
```

---

### generateThumbnail(options)

从视频截取一帧生成缩略图。

| 参数       | 类型   | 默认值       | 说明                                   |
| ---------- | ------ | ------------ | -------------------------------------- |
| inputPath  | string | —            | 输入视频路径                           |
| outputPath | string | —            | 输出图片路径（.jpg 或 .png）           |
| time       | string | `"00:00:01"` | 截帧时间点                             |
| width      | number | 原始         | 缩略图宽度，高度等比缩放               |
| quality    | number | `2`          | 图像质量 1~31（越小越好，仅 jpg 有效） |

```ts
generateThumbnail({
  inputPath: '/path/video.mp4',
  outputPath: '/path/thumb.jpg',
  time: '00:00:03',
  width: 320,
  success: (res) => console.log('截图完成'),
});
```

---

### trimMedia(options)

裁剪音频或视频片段。

| 参数       | 类型    | 默认值 | 说明                                                |
| ---------- | ------- | ------ | --------------------------------------------------- |
| inputPath  | string  | —      | 输入路径                                            |
| outputPath | string  | —      | 输出路径                                            |
| startTime  | string  | —      | 起始时间，`"HH:MM:SS"` 或秒数（**必填**）           |
| endTime    | string  | —      | 结束时间，与 `duration` 二选一                      |
| duration   | string  | —      | 裁剪时长，与 `endTime` 二选一                       |
| copyCodec  | boolean | `true` | `true`=流复制（速度快），`false`=重编码（时间精确） |

```ts
// 流复制模式（快，关键帧对齐）
trimMedia({
  inputPath: '/path/video.mp4',
  outputPath: '/path/clip.mp4',
  startTime: '00:00:10',
  endTime: '00:00:30',
  copyCodec: true,
  success: (res) => console.log('裁剪完成'),
});

// 重编码模式（慢，帧精确）
trimMedia({
  inputPath: '/path/video.mp4',
  outputPath: '/path/clip_exact.mp4',
  startTime: '10.5',
  duration: '5',
  copyCodec: false,
  success: (res) => console.log('裁剪完成'),
});
```

> **iOS 端兼容性优化**：流复制模式下命令自动附带 `-avoid_negative_ts make_zero -reset_timestamps 1 -movflags +faststart` 三个标志（重置 PTS 时间戳到 0、moov atom 移到文件头），避免 iOS AVPlayer / 系统相册播放时出现"前几帧花屏 + 整段龟速"的兼容问题。重编码模式 iOS 强制使用 `h264_videotoolbox` 硬编 + aac，输出兼容性最好。

---

### convertFormat(options)

音视频格式转换。

| 参数         | 类型   | 默认值 | 说明                           |
| ------------ | ------ | ------ | ------------------------------ |
| inputPath    | string | —      | 输入路径                       |
| outputPath   | string | —      | 输出路径（扩展名决定目标格式） |
| videoCodec   | string | 自动   | 视频编码器                     |
| audioCodec   | string | 自动   | 音频编码器                     |
| videoBitrate | string | 自动   | 视频码率                       |
| audioBitrate | string | 自动   | 音频码率                       |

```ts
convertFormat({
  inputPath: '/path/video.mp4',
  outputPath: '/path/video.mov',
  success: (res) => console.log('转换完成'),
});
```

---

### cancelFFmpeg(sessionId)

取消指定任务。`sessionId` 从 `start` 回调或 `getSessions()` 获取。

```ts
let currentSessionId = 0;

executeFFmpeg({
  cmd: '...',
  start: (id) => {
    currentSessionId = id;
  },
});

// 取消
cancelFFmpeg(currentSessionId);
```

---

### cancelAllFFmpeg()

取消所有正在执行的 FFmpeg 任务。

---

### getSessions()

获取所有任务的 session 列表。

```ts
const sessions = getSessions();
sessions.forEach((s) => {
  console.log(s.sessionId, s.state, s.returnCode);
});
```

---

### getRealPath(path)

将相对路径或 uni 路径（`file://...`）解析为系统绝对路径，并自动创建父目录。

```ts
const absPath = getRealPath('_doc/output/audio.m4a');
```

---

## 数据类型

### FFmpegSession

| 字段       | 类型   | 说明                                |
| ---------- | ------ | ----------------------------------- |
| sessionId  | number | 任务 ID                             |
| returnCode | number | 返回码，0=成功，255=取消，其他=失败 |
| state      | string | `CREATED/RUNNING/COMPLETED/FAILED`  |
| command    | string | 执行的命令                          |
| output     | string | FFmpeg 全部日志                     |
| duration   | number | 执行耗时（ms）                      |
| startTime  | number | 开始时间戳（ms）                    |
| endTime    | number | 结束时间戳（ms）                    |
| platform   | string | `app-android` 或 `app-ios`          |

### FFmpegProgress

| 字段             | 类型   | 说明                          |
| ---------------- | ------ | ----------------------------- |
| sessionId        | number | 任务 ID                       |
| time             | number | 已处理时长（ms）              |
| size             | number | 已输出文件大小（bytes）       |
| bitrate          | number | 当前码率（kb/s）              |
| speed            | number | 处理速度比（2.0 = 2x 实时速） |
| videoFps         | number | 当前视频帧率                  |
| videoQuality     | number | 当前质量因子                  |
| videoFrameNumber | number | 已处理帧数                    |

#### 百分比进度换算

`progress` 回调本身**不直接给百分比**，而是给"已处理时长 `time`（ms）"。换算成百分比需要先拿到媒体总时长（用 `getMediaInfo` 一次性获取），再用 `time / 1000 / 总时长` 计算：

```ts
import { getMediaInfo, compressVideo } from '@/uni_modules/dh-ffmpeg';

const inputPath = '/path/input.mp4';
let totalSec = 0;

// 1) 先取总时长（秒）
getMediaInfo({
  path: inputPath,
  success: (info) => {
    totalSec = info.duration;

    // 2) 启动转码，progress 回调里换算百分比
    compressVideo({
      inputPath,
      outputPath: '/path/output.mp4',
      resolution: '720p',
      progress: (stats) => {
        const processedSec = stats.time / 1000;             // 已处理秒数
        const raw = totalSec > 0 ? (processedSec / totalSec) * 100 : 0;
        const percent = Math.max(0, Math.min(100, raw));    // clamp 到 [0, 100]
        console.log(`进度 ${percent.toFixed(1)}%  速度 ${stats.speed.toFixed(1)}x  fps ${stats.videoFps.toFixed(0)}`);
        // → 进度 32.5%  速度 1.8x  fps 28
      },
      success: (res) => console.log('完成'),
    });
  },
  fail: (err) => console.log('获取媒体信息失败', err.errMsg),
});
```

**为什么不直接给百分比**：FFmpeg 自身的进度信息只到"已处理时长"，对总时长一无所知（输入流可能是网络流、屏幕录制等无固定时长的场景）。把"算百分比"留给应用层是更通用的设计。如果你的输入文件本地、时长固定，按上面套路写一次性即可。

> 💡 部分场景下 `time` 可能略超总时长（最后几个 packet 的封装余量），所以**务必 clamp 到 `[0, 100]`** 再呈现给用户，避免出现 100.3% 的尴尬。

### FFmpegLogEntry

每条 `log` 回调推送一条 `FFmpegLogEntry`（即 ffmpeg stderr 的逐行日志）。

| 字段      | 类型   | 说明                                                |
| --------- | ------ | --------------------------------------------------- |
| sessionId | number | 任务 ID（同 FFmpegSession.sessionId）               |
| level     | number | 日志级别（参考 [FFmpeg 日志级别](https://ffmpeg.org/ffmpeg.html#Generic-options)：8=ERROR / 16=WARNING / 32=INFO / 40=VERBOSE / 48=DEBUG） |
| message   | string | 日志内容                                            |

---

## 错误码

| 错误码 | 常量                         | 说明                               |
| ------ | ---------------------------- | ---------------------------------- |
| 10001  | FFMPEG_ERR_EXECUTION_FAILED  | FFmpeg 执行失败（returnCode != 0） |
| 10002  | FFMPEG_ERR_CANCELLED         | 任务被取消（returnCode == 255）    |
| 10003  | FFMPEG_ERR_MEDIA_INFO_FAILED | 媒体信息获取失败                   |
| 10004  | FFMPEG_ERR_INVALID_PARAMS    | 参数无效                           |
| 10005  | FFMPEG_ERR_UNSUPPORTED       | 平台不支持（非 App 平台）          |

---

## 注意事项

- 所有路径支持绝对路径、`file://` 前缀路径和 uni 相对路径（`_doc/`、`_downloads/` 等）
- 输出路径的父目录若不存在会自动创建
- `copyCodec: true`（流复制）速度极快但裁剪精度为关键帧级，`copyCodec: false`（重编码）速度慢但精确到帧
- `compressVideo` 默认走**系统硬件编码**（Android `h264_mediacodec` / iOS `h264_videotoolbox`），速度快、画质中等，无需关心 `crf` / `preset`；切换软编（`libx264` / `libopenh264`）后 `crf` / `preset` 才真正生效
- 在小程序、H5 等非 App 平台调用会立即触发 `fail` 回调（errCode: 10005）

---

## FFmpeg 变体说明（按需切换）

本插件 Android 端默认依赖 [`io.github.jamaismagic.ffmpeg:ffmpeg-kit-lts-tls-16kb:6.1.4`](https://central.sonatype.com/artifact/io.github.jamaismagic.ffmpeg/ffmpeg-kit-lts-tls-16kb)，由社区 fork 维护并发布到 **Maven Central**，已适配 **Android 15+ 的 16KB page size**。

JamaisMagic 共发布 5 个 LTS 16KB 变体可选：

| 变体                       | AAR 体积 | 协议     | HTTPS | H.264 编码                           | H.265                    | 其他亮点                           |
| -------------------------- | -------- | -------- | ----- | ------------------------------------ | ------------------------ | ---------------------------------- |
| `lts-min-16kb`             | 28MB     | LGPL     | ❌    | mediacodec 硬编                      | ❌                       | 极简                               |
| **`lts-tls-16kb`（默认）** | 37MB     | **LGPL** | ✅    | mediacodec                           | ❌                       | 多了 HTTPS                         |
| `lts-16kb`                 | 49MB     | **GPL**  | ✅    | mediacodec + **libx264**             | **libx265**              | + libvpx + libmp3lame              |
| `lts-full-16kb`            | 72MB     | LGPL     | ✅    | mediacodec + **libopenh264**         | **libkvazaar**           | + libvpx + libaom + 字幕/OCR/字体  |
| `lts-full-gpl-16kb`        | 84MB     | **GPL**  | ✅    | 全 (mediacodec/openh264/**libx264**) | 全 (kvazaar/**libx265**) | + libvidstab/libxvid/librubberband |

iOS 端使用 [`dh_ffmpeg_kit`](https://gitee.com/dinghui123/dh-ffmpeg-kit-ios) Pod（自维护 gitee 镜像，6.0 版本，**LGPL** 协议，含 videotoolbox 硬编 + libkvazaar/libvpx/libdav1d/libmp3lame/libopus 等主流 codec，**不含 libx264/libx265 等 GPL codec**，跟 Android 端协议一致）。镜像自 [luthviar/ffmpeg-kit-ios-full](https://github.com/luthviar/ffmpeg-kit-ios-full)。

#### 怎么换变体

修改本插件 `utssdk/app-android/config.json`：

```json
{
  "dependencies": ["io.github.jamaismagic.ffmpeg:ffmpeg-kit-lts-full-16kb:6.1.4"],
  "minSdkVersion": "23"
}
```

然后调用 `compressVideo` 时通过 `videoCodec` 选择具体编码器（见 `compressVideo` 章节）。

#### 协议提示

- 选 `lts-min-16kb` / `lts-tls-16kb` / `lts-full-16kb` → **LGPL**，商业 App 友好
- 选 `lts-16kb` / `lts-full-gpl-16kb` → **GPL**，商业闭源 App 引入前请确认你的法务策略

---

## iOS 端注意事项

- **`<image>` / `<video>` 控件加载本地路径需 `file://` 前缀**：插件返回的输出路径都是 iOS 系统绝对路径（`/var/mobile/...`），uni-app 的 `<image>` / `<video>` 控件加载时需要在前面拼 `file://`，否则不显示。
- **演示页 `<video>` 控件预览有兼容问题**：iOS WebView 加载 `file://` 协议视频时存在已知"龟速"问题，**与 dh-ffmpeg 输出的视频文件无关**——把同一个文件用 `uni.saveVideoToPhotosAlbum` 保存到系统相册后再看，播放完全正常。生产环境用 `plus.runtime.openFile()` 调系统播放器，或集成成熟的视频播放器组件。
- **iOS 不含 GPL codec**：`dh_ffmpeg_kit` 6.0 是 LGPL 变体，**不含 `libx264` / `libx265`**。需要 H.265 输出时用 `videoCodec: 'libkvazaar'`（已编入），需要 H.264 输出时用 `videoCodec: 'h264_videotoolbox'`（硬件加速，默认）或 `'libopenh264'`（LGPL 软编）。
- **路径自动处理**：所有传入插件的 `inputPath` / `outputPath` 都会经过 `toAbsPath` 转换：`file://` 前缀自动 strip，`/var/...` / `/private/var/...` 直接使用，其他路径走 `UTSiOS.convert2AbsFullPath`。
