// dh-ffmpeg TypeScript declarations
// Platforms: App-Android / App-iOS

interface UniError {
	errSubject: string
	errCode: number
	errMsg: string
}

export declare const FFMPEG_ERROR_SUBJECT: string
export declare const FFMPEG_ERR_EXECUTION_FAILED: 10001
export declare const FFMPEG_ERR_CANCELLED: 10002
export declare const FFMPEG_ERR_MEDIA_INFO_FAILED: 10003
export declare const FFMPEG_ERR_INVALID_PARAMS: 10004
export declare const FFMPEG_ERR_UNSUPPORTED: 10005

export type FFmpegSession = {
	sessionId: number
	returnCode: number
	state: string
	command: string
	output: string
	duration: number
	startTime: number
	endTime: number
	platform: string
}

export type FFmpegProgress = {
	sessionId: number
	time: number
	size: number
	bitrate: number
	speed: number
	videoFps: number
	videoQuality: number
	videoFrameNumber: number
}

export type FFmpegLogEntry = {
	sessionId: number
	level: number
	message: string
}

export type VideoStreamInfo = {
	index: number
	codec: string
	width: number
	height: number
	/** 帧率，如 30、29.97（解析自 r_frame_rate） */
	fps: number
	/** 原始分数字符串，如 "30/1"，给精度敏感场景 */
	fpsRaw: string
	/** bits/s，无值时 0 */
	bitrate: number
	/** 时长（秒） */
	duration: number
}

export type AudioStreamInfo = {
	index: number
	codec: string
	/** 采样率 Hz */
	sampleRate: number
	channels: number
	channelLayout: string
	/** bits/s，无值时 0 */
	bitrate: number
	duration: number
}

export type MediaInfoResult = {
	filename: string
	/** 智能解析后的格式名（按文件扩展名匹配），如 "mp4"、"mov"、"flac" */
	format: string
	/** ffprobe 原始 demuxer 名（如 "mov,mp4,m4a,3gp,3g2,mj2"） */
	formatRaw: string
	duration: number
	/** 总码率 bits/s，无值时 0 */
	bitrate: number
	size: number
	videoStreams: VideoStreamInfo[]
	audioStreams: AudioStreamInfo[]
	rawData: Record<string, any>
}

export type ExecuteFFmpegOptions = {
	cmd: string
	start?: (sessionId: number) => void
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type ExecuteFFprobeOptions = {
	cmd: string
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type GetMediaInfoOptions = {
	path: string
	timeout?: number
	log?: (entry: FFmpegLogEntry) => void
	success?: (info: MediaInfoResult) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type ExtractAudioOptions = {
	inputPath: string
	outputPath: string
	bitrate?: string
	sampleRate?: number
	channels?: number
	startTime?: string
	duration?: string
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type MergeAVOptions = {
	videoPath: string
	audioPath: string
	outputPath: string
	videoCodec?: string
	audioCodec?: string
	shortest?: boolean
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type MixAudioOptions = {
	inputPath1: string
	inputPath2: string
	outputPath: string
	volume1?: number
	volume2?: number
	bitrate?: string
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type CompressVideoOptions = {
	inputPath: string
	outputPath: string
	/**
	 * 视频编码器名称
	 * - Android 默认 'h264_mediacodec'（系统硬编）
	 * - iOS 默认 'h264_videotoolbox'（系统硬编）
	 * - 其他可选 'libopenh264'(LGPL 软编)、'libx264'(GPL 软编)、'libkvazaar'(H.265 LGPL)、'libx265'(H.265 GPL)
	 */
	videoCodec?: string
	resolution?: string
	videoBitrate?: string
	audioBitrate?: string
	fps?: number
	/** CRF 18-28，仅软编（libx264/libopenh264）真生效；硬编时按区间映射成码率 */
	crf?: number
	/** 仅 libx264 生效 */
	preset?: string
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type ThumbnailOptions = {
	inputPath: string
	outputPath: string
	time?: string
	width?: number
	quality?: number
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type TrimMediaOptions = {
	inputPath: string
	outputPath: string
	startTime: string
	endTime?: string
	duration?: string
	copyCodec?: boolean
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export type ConvertFormatOptions = {
	inputPath: string
	outputPath: string
	videoCodec?: string
	audioCodec?: string
	videoBitrate?: string
	audioBitrate?: string
	progress?: (stats: FFmpegProgress) => void
	log?: (entry: FFmpegLogEntry) => void
	success?: (res: FFmpegSession) => void
	fail?: (err: UniError) => void
	complete?: () => void
}

export declare function executeFFmpeg(options: ExecuteFFmpegOptions): void
export declare function executeFFprobe(options: ExecuteFFprobeOptions): void
export declare function getMediaInfo(options: GetMediaInfoOptions): void
export declare function cancelFFmpeg(sessionId: number): void
export declare function cancelAllFFmpeg(): void
export declare function getSessions(): FFmpegSession[]
export declare function getRealPath(path: string): string
export declare function extractAudio(options: ExtractAudioOptions): void
export declare function mergeAV(options: MergeAVOptions): void
export declare function mixAudio(options: MixAudioOptions): void
export declare function compressVideo(options: CompressVideoOptions): void
export declare function generateThumbnail(options: ThumbnailOptions): void
export declare function trimMedia(options: TrimMediaOptions): void
export declare function convertFormat(options: ConvertFormatOptions): void
