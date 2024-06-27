import { IWebGLCanvasContext } from "../data/IWebGLCanvasContext";

/**
 * 默认WebGL上下文信息。
 */
export const defaultWebGLCanvasContext: IWebGLCanvasContext = Object.freeze({
    contextId: "webgl2",
    depth: true,
    stencil: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
});
