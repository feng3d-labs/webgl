import { Buffer, CanvasContext, ChainMap, IndicesDataTypes, RenderPassDescriptor, RenderPipeline, Sampler, Texture, VertexAttributes } from '@feng3d/render-api';
import { defaultWebGLContextAttributes } from '../data/polyfills/CanvasContext';
import { Renderbuffer } from '../data/Renderbuffer';
import { TransformFeedback } from '../data/TransformFeedbackPass';
import { Capabilities } from './Capabilities';

declare global
{
    interface WebGLRenderingContext
    {
        _capabilities: Capabilities;
        //
        _bufferMap: WeakMap<Buffer, WebGLBuffer>
        _textures: WeakMap<Texture, WebGLTexture>
        _renderbuffers: WeakMap<Renderbuffer, WebGLRenderbuffer>;
        _framebuffers: WeakMap<RenderPassDescriptor, WebGLFramebuffer>;
        _vertexArrays: ChainMap<[RenderPipeline, VertexAttributes, IndicesDataTypes], WebGLVertexArrayObject>;
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
    let gl: WebGLRenderingContext = canvasContext['_gl'];
    if (gl) return gl;

    const canvas = typeof canvasContext.canvasId === 'string' ? document.getElementById(canvasContext.canvasId) as HTMLCanvasElement : canvasContext.canvasId;
    gl = canvasContext['_gl'] = getWebGLContext(canvas, canvasContext);

    canvasContext.webGLContextAttributes;
    //
    gl._capabilities = new Capabilities(gl);

    gl._bufferMap = new WeakMap();
    gl._textures = new WeakMap();
    gl._renderbuffers = new WeakMap();
    gl._framebuffers = new WeakMap();
    gl._vertexArrays = new ChainMap();
    gl._samplers = new WeakMap();
    gl._transforms = new WeakMap();
    gl._programs = {};
    gl._shaders = {};

    //
    canvas.addEventListener('webglcontextlost', _onContextLost, false);
    canvas.addEventListener('webglcontextrestored', _onContextRestore, false);
    canvas.addEventListener('webglcontextcreationerror', _onContextCreationError, false);

    return gl;
}

function _onContextLost(event: Event)
{
    event.preventDefault();

    console.warn('WebGLRenderer: Context Lost.');
}

function _onContextRestore()
{
    console.warn('WebGLRenderer: Context Restored.');
}

function _onContextCreationError(event: WebGLContextEvent)
{
    console.error('WebGLRenderer: A WebGL context could not be created. Reason: ', event.statusMessage);
}

function getWebGLContext(canvas: HTMLCanvasElement | OffscreenCanvas, canvasContext: CanvasContext): WebGLRenderingContext
{
    const contextAttributes = Object.assign({}, defaultWebGLContextAttributes, canvasContext.webGLContextAttributes);

    // 使用用户提供参数获取WebGL上下文
    let gl = canvas.getContext(canvasContext.webGLcontextId || 'webgl2', contextAttributes);
    gl || console.warn(`无法使用用户提供参数获取指定WebGL上下文`, contextAttributes);

    gl = canvas.getContext('webgl2', contextAttributes)
        || canvas.getContext('webgl2')
        || canvas.getContext('webgl', contextAttributes)
        || canvas.getContext('webgl');

    gl || console.error(`无法获取WebGL上下文。`);

    return gl as any;
}
