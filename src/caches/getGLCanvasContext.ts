import { CanvasContext } from "@feng3d/render-api";
import { defaultWebGLContextAttributes } from "../data/polyfills/CanvasContext";
import { ChainMap } from "../utils/ChainMap";
import { getCapabilities } from "./getCapabilities";

/**
 * 获取WebGL上下文。
 *
 * @param canvasContext
 * @returns
 */
export function getGLCanvasContext(canvasContext: CanvasContext)
{
    const key = canvasContext.canvasId;
    let value = canvasContextMap.get(canvasContext);
    if (!value)
    {
        const canvas = typeof canvasContext.canvasId === "string" ? document.getElementById(canvasContext.canvasId) as HTMLCanvasElement : canvasContext.canvasId;
        value = getWebGLContext(canvas, canvasContext);

        canvasContext.webGLContextAttributes
        //
        getCapabilities(value);
        initMap(value);

        //
        canvas.addEventListener("webglcontextlost", _onContextLost, false);
        canvas.addEventListener("webglcontextrestored", _onContextRestore, false);
        canvas.addEventListener("webglcontextcreationerror", _onContextCreationError, false);

        canvasContextMap.set(canvasContext, value);
    }

    return value;
}

function initMap(gl: WebGLRenderingContext)
{
    gl._buffers = new Map();
    gl._textures = new Map();
    gl._renderbuffers = new Map();
    gl._framebuffers = new Map();
    gl._vertexArrays = new ChainMap();
    gl._samplers = new Map();
    gl._transforms = new Map();
    gl._programs = {};
    gl._shaders = {};
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

function getWebGLContext(canvas: HTMLCanvasElement | OffscreenCanvas, canvasContext: CanvasContext)
{
    const contextAttributes = Object.assign({}, defaultWebGLContextAttributes, canvasContext.webGLContextAttributes);

    // 使用用户提供参数获取WebGL上下文
    let gl = canvas.getContext(canvasContext.webGLcontextId || "webgl2", contextAttributes) as any;
    gl || console.warn(`无法使用用户提供参数获取指定WebGL上下文`, contextAttributes);

    gl = canvas.getContext("webgl2", contextAttributes)
        || canvas.getContext("webgl2")
        || canvas.getContext("webgl", contextAttributes)
        || canvas.getContext("webgl");

    gl || console.error(`无法获取WebGL上下文。`);

    return gl;
}

const canvasContextMap = new WeakMap<CanvasContext, WebGLRenderingContext>();
