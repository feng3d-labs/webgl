/**
 * 画布(WebGL)上下文信息。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
 */
export class GLCanvasContext implements WebGLContextAttributes
{
    /**
     * 画布编号。
     */
    canvasId?: string

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

    constructor(canvasContext?: GLCanvasContext)
    {
        if (!canvasContext) return;

        for (var key in canvasContext)
        {
            if (canvasContext.hasOwnProperty(key))
            {
                this[key] = canvasContext[key];
            }
        }
    }

    static getInstance(context: GLCanvasContext): GLCanvasContext
    {
        if (!context) return undefined;

        if (context instanceof GLCanvasContext) return context;

        return new GLCanvasContext(context);
    }
}