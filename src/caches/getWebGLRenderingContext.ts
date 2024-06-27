import { IWebGLCanvasContext } from "../data/IWebGLCanvasContext";

/**
 * 获取WebGL上下文。
 *
 * @param canvasContext
 * @returns
 */
export function getWebGLRenderingContext(canvasContext: IWebGLCanvasContext)
{
    let gl = canvasContextMap.get(canvasContext);
    if (!gl)
    {
        const canvas = getCanvas(canvasContext);
        gl = getWebGLContext(canvas, canvasContext);

        //
        canvas.addEventListener("webglcontextlost", _onContextLost, false);
        canvas.addEventListener("webglcontextrestored", _onContextRestore, false);
        canvas.addEventListener("webglcontextcreationerror", _onContextCreationError, false);

        canvasContextMap.set(canvasContext, gl);
    }

    return gl;
}

function _onContextLost(event: Event)
{
    event.preventDefault();

    console.warn("WebGLRenderer: Context Lost.");
}

function _onContextRestore()
{
    console.warn("WebGLRenderer: Context Restored.");
}

function _onContextCreationError(event: WebGLContextEvent)
{
    console.error("WebGLRenderer: A WebGL context could not be created. Reason: ", event.statusMessage);
}

let autoId = 1;
function autoCreateCanvas()
{
    const canvas = document.createElement("canvas");
    canvas.id = `autoCreateCanvas_${autoId++}`;
    canvas.style.position = "fixed";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    document.body.appendChild(canvas);

    return canvas;
}

function getCanvas(canvasContext: IWebGLCanvasContext)
{
    let canvas = document.getElementById(canvasContext.canvasId) as HTMLCanvasElement;
    if (!canvas || !(canvas instanceof HTMLCanvasElement))
    {
        canvas = autoCreateCanvas();
    }

    return canvas;
}

function getWebGLContext(canvas: HTMLCanvasElement, canvasContext: IWebGLCanvasContext)
{
    const contextAttributes = Object.assign({
        contextId: "webgl2",
        depth: true,
        stencil: true,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
    } as Partial<IWebGLCanvasContext>, canvasContext);

    // 使用用户提供参数获取WebGL上下文
    let gl = canvas.getContext(contextAttributes.contextId, contextAttributes) as any;
    if (gl) return gl;

    gl = canvas.getContext("webgl", contextAttributes) || canvas.getContext("webgl2", contextAttributes);
    gl && console.warn(`无法使用用户提供参数获取指定WebGL上下文，${canvasContext}`);
    if (gl) return gl;

    // 使用默认参数获取WebGL上下文
    gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
    gl && console.warn(`无法使用用户提供参数获取WebGL上下文，${canvasContext}`);
    if (gl) return gl;

    console.error(`无法获取WebGL上下文。`);

    return null;
}

const canvasContextMap = new Map<IWebGLCanvasContext, WebGLRenderingContext>();
