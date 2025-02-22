import { Data } from "@feng3d/render-api";

/**
 * 画布(WebGL)上下文信息。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export class GLCanvasContext extends Data implements WebGLContextAttributes
{
    /**
     * 画布编号。
     */
    canvasId?: string;

    /**
     * WebGL上下文类型
     */
    contextId?: "webgl" | "webgl2" = "webgl2";

    depth?: boolean = true;
    stencil?: boolean = true;
    antialias?: boolean = false;
    premultipliedAlpha?: boolean = true;
    preserveDrawingBuffer?: boolean = false;
    powerPreference?: WebGLPowerPreference = "default";
    failIfMajorPerformanceCaveat?: boolean = false;
}