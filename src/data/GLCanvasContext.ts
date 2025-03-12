
/**
 * 画布(WebGL)上下文信息。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export interface GLCanvasContext extends WebGLContextAttributes
{
    /**
     * 画布编号。
     */
    canvasId?: string;

    /**
     * WebGL上下文类型
     */
    contextId?: "webgl" | "webgl2";

    depth?: boolean;
    stencil?: boolean;
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: WebGLPowerPreference;
    failIfMajorPerformanceCaveat?: boolean;
}

/**
 * 默认画布(WebGL)上下文信息。
 */
export const defaultGLCanvasContext: GLCanvasContext = {
    contextId: "webgl2",
    depth: true,
    stencil: true, 
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
}
