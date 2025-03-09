
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

export class GLCanvasContext { }

GLCanvasContext._reg((context) =>
{
    context.contextId ??= "webgl2";
    context.depth ??= true;
    context.stencil ??= true;
    context.antialias ??= false;
    context.premultipliedAlpha ??= true;
    context.preserveDrawingBuffer ??= false;
    context.powerPreference ??= "default";
    context.failIfMajorPerformanceCaveat ??= false;

    return () =>
    {

    };
});