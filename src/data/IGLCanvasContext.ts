/**
 * 画布(WebGL)上下文信息。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export interface IGLCanvasContext extends WebGLContextAttributes
{
    /**
     * 画布编号。
     */
    canvasId?: string

    /**
     * WebGL上下文类型
     */
    contextId?: "webgl" | "webgl2"
}