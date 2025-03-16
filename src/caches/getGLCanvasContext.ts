import { CanvasContext, GBuffer, IIndicesDataTypes, RenderPassDescriptor, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { defaultWebGLContextAttributes } from "../data/polyfills/CanvasContext";
import { Renderbuffer } from "../data/Renderbuffer";
import { TransformFeedback } from "../data/TransformFeedbackPass";
import { ChainMap } from "../utils/ChainMap";
import { getCapabilities } from "./getCapabilities";

declare global
{
    interface WebGLRenderingContext
    {
        _bufferMap: WeakMap<GBuffer, WebGLBuffer>
        _textures: WeakMap<Texture, WebGLTexture>
        _renderbuffers: WeakMap<Renderbuffer, WebGLRenderbuffer>;
        _framebuffers: WeakMap<RenderPassDescriptor, WebGLFramebuffer>;
        _vertexArrays: ChainMap<[RenderPipeline, VertexAttributes, IIndicesDataTypes], WebGLVertexArrayObject>;
        _samplers: WeakMap<Sampler, WebGLSampler>;
        _transforms: WeakMap<TransformFeedback, WebGLTransformFeedback>;
        _programs: { [key: string]: WebGLProgram }
        _shaders: { [key: string]: WebGLShader }
    }
}

/**
 * 获取WebGL上下文。
 *
 * @param canvasContext
 * @returns
 */
export function getGLCanvasContext(canvasContext: CanvasContext)
{
    let value = canvasContextMap.get(canvasContext);
    if (!value)
    {
        const canvas = typeof canvasContext.canvasId === "string" ? document.getElementById(canvasContext.canvasId) as HTMLCanvasElement : canvasContext.canvasId;
        value = getWebGLContext(canvas, canvasContext);

        canvasContext.webGLContextAttributes
        //
        getCapabilities(value);

        value._bufferMap = new WeakMap();
        value._textures = new WeakMap();
        value._renderbuffers = new WeakMap();
        value._framebuffers = new WeakMap();
        value._vertexArrays = new ChainMap();
        value._samplers = new WeakMap();
        value._transforms = new WeakMap();
        value._programs = {};
        value._shaders = {};

        //
        canvas.addEventListener("webglcontextlost", _onContextLost, false);
        canvas.addEventListener("webglcontextrestored", _onContextRestore, false);
        canvas.addEventListener("webglcontextcreationerror", _onContextCreationError, false);

        canvasContextMap.set(canvasContext, value);
    }

    return value;
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

function getWebGLContext(canvas: HTMLCanvasElement | OffscreenCanvas, canvasContext: CanvasContext): WebGLRenderingContext 
{
    const contextAttributes = Object.assign({}, defaultWebGLContextAttributes, canvasContext.webGLContextAttributes);

    // 使用用户提供参数获取WebGL上下文
    let gl = canvas.getContext(canvasContext.webGLcontextId || "webgl2", contextAttributes);
    gl || console.warn(`无法使用用户提供参数获取指定WebGL上下文`, contextAttributes);

    gl = canvas.getContext("webgl2", contextAttributes)
        || canvas.getContext("webgl2")
        || canvas.getContext("webgl", contextAttributes)
        || canvas.getContext("webgl");

    gl || console.error(`无法获取WebGL上下文。`);

    return gl as any;
}

const canvasContextMap = new WeakMap<CanvasContext, WebGLRenderingContext>();
