import { IRenderingContext } from "../data/ICanvasContext";
import { defaults } from "../defaults/defaults";
import { getCapabilities } from "./getCapabilities";

/**
 * 获取WebGL上下文。
 *
 * @param renderingContext
 * @returns
 */
export function getRenderingContext(renderingContext: IRenderingContext)
{
    const key = renderingContext.canvasId;
    let value = canvasContextMap.get(key);
    if (!value)
    {
        const canvas = getCanvas(renderingContext);
        value = getWebGLContext(canvas, renderingContext);

        //
        getCapabilities(value);
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
    gl._buffers = new WeakMap();
    gl._elementBuffers = new WeakMap();
    gl._textures = new WeakMap();
    gl._renderbuffers = new WeakMap();
    gl._framebuffers = new WeakMap();
    gl._vertexArrayObjects = new WeakMap();
    gl._programs = {};
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

function getCanvas(canvasContext: IRenderingContext)
{
    let canvas = document.getElementById(canvasContext.canvasId) as HTMLCanvasElement;
    if (!canvas || !(canvas instanceof HTMLCanvasElement))
    {
        canvas = autoCreateCanvas(canvasContext.canvasId);
    }

    return canvas;
}

function getWebGLContext(canvas: HTMLCanvasElement, canvasContext: IRenderingContext)
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
