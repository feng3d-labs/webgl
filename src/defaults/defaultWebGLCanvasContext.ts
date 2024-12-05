import { IGLCanvasContext } from "../data/IGLRenderingContext";

/**
 * 默认WebGL上下文信息。
 */
export const defaultCanvasContext: IGLCanvasContext = Object.freeze({
    contextId: "webgl2",
    depth: true,
    stencil: true,
    antialias: false,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: "default",
    failIfMajorPerformanceCaveat: false,
});
