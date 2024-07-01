import { IWebGLCanvasContext } from "../data/IWebGLCanvasContext";
import { defaults } from "../defaults/defaults";
import { getWebGLCapabilities } from "./getWebGLCapabilities";

/**
 * 获取WebGL上下文。
 *
 * @param canvasContext
 * @returns
 */
export function getWebGLRenderingContext(canvasContext: IWebGLCanvasContext)
{
    const key = canvasContext.canvasId;
    let value = canvasContextMap.get(key);
    if (!value)
    {
        const canvas = getCanvas(canvasContext);
        value = getWebGLContext(canvas, canvasContext);

        //
        getWebGLCapabilities(value);
        initMap(value);

        //
        canvas.addEventListener("webglcontextlost", _onContextLost, false);
        canvas.addEventListener("webglcontextrestored", _onContextRestore, false);
        canvas.addEventListener("webglcontextcreationerror", _onContextCreationError, false);

        canvasContextMap.set(key, value);
    }

    return value;
}

function initMap(gl: WebGLRenderingContext)
{
    gl._webGLBufferMap = new WeakMap();
    gl._elementBufferMap = new WeakMap();
    gl._textureMap = new WeakMap();
    gl._renderbuffers_ = new WeakMap();
    gl._compileShaderResults = {};
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

function autoCreateCanvas(canvasId: string)
{
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;
    document.body.appendChild(canvas);

    return canvas;
}

function getCanvas(canvasContext: IWebGLCanvasContext)
{
    let canvas = document.getElementById(canvasContext.canvasId) as HTMLCanvasElement;
    if (!canvas || !(canvas instanceof HTMLCanvasElement))
    {
        canvas = autoCreateCanvas(canvasContext.canvasId);
    }

    return canvas;
}

function getWebGLContext(canvas: HTMLCanvasElement, canvasContext: IWebGLCanvasContext)
{
    const contextAttributes = Object.assign({}, defaults.webGLCanvasContext, canvasContext);

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

const canvasContextMap = new Map<string, WebGLRenderingContext>();
