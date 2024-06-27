export interface IWebGLCanvasContext extends WebGLContextAttributes
{
    canvasId: string
    contextId: "webgl" | "webgl2"
}