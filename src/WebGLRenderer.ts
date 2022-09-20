/* eslint-disable no-new */
import { lazy } from '@feng3d/polyfill';
import { RenderAtomic } from './data/RenderAtomic';
import { WebGLAttributes } from './gl/WebGLAttributes';
import { WebGLBindingStates } from './gl/WebGLBindingStates';
import { WebGLBufferRenderer } from './gl/WebGLBufferRenderer';
import { WebGLRenderbuffers } from './gl/WebGLBuffers';
import { WebGLCacheStates } from './gl/WebGLCacheStates';
import { WebGLCapabilities } from './gl/WebGLCapabilities';
import { WebGLElementBufferRenderer } from './gl/WebGLElementBufferRenderer';
import { WebGLExtensions } from './gl/WebGLExtensions';
import { WebGLFramebuffers } from './gl/WebGLFramebuffers';
import { WebGLInfo } from './gl/WebGLInfo';
import { WebGLRenderParams } from './gl/WebGLRenderParams';
import { WebGLShaders } from './gl/WebGLShaders';
import { WebGLState } from './gl/WebGLState';
import { WebGLTextures } from './gl/WebGLTextures';
import { WebGLUniforms } from './gl/WebGLUniforms';

export interface WebGLRendererParameters extends WebGLContextAttributes
{
    /**
     * A Canvas where the renderer draws its output.
     */
    canvas: HTMLCanvasElement;
}

/**
 * WEBGL 渲染器
 *
 * 所有渲染都由该渲染器执行
 */
export class WebGLRenderer
{
    private _canvas: HTMLCanvasElement;

    gl: WebGLRenderingContext;

    /**
     * WebGL扩展
     */
    extensions: WebGLExtensions;

    /**
     * WEBGL支持功能
     */
    capabilities: WebGLCapabilities;

    /**
     * WebGL纹理
     */
    textures: WebGLTextures;

    /**
     * WebGL信息
     */
    info: WebGLInfo;

    /**
     * 缓存WebGL状态
     */
    cacheStates: WebGLCacheStates;
    shaders: WebGLShaders;
    state: WebGLState;
    bindingStates: WebGLBindingStates;
    attributes: WebGLAttributes;
    renderParams: WebGLRenderParams;
    uniforms: WebGLUniforms;
    renderbuffers: WebGLRenderbuffers;
    framebuffers: WebGLFramebuffers;

    bufferRenderer: WebGLBufferRenderer;
    elementBufferRenderer: WebGLElementBufferRenderer;

    constructor(parameters?: Partial<WebGLRendererParameters>)
    {
        this._canvas = parameters.canvas;
        if (!this._canvas)
        {
            this._canvas = document.createElement('canvas');
            this._canvas.style.display = 'block';
        }
        this._canvas.addEventListener('webglcontextlost', this._onContextLost, false);
        this._canvas.addEventListener('webglcontextrestored', this._onContextRestore, false);
        this._canvas.addEventListener('webglcontextcreationerror', this._onContextCreationError, false);

        parameters = Object.assign({
            depth: true,
            stencil: true,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'default',
            failIfMajorPerformanceCaveat: false,
        } as Partial<WebGLContextAttributes>, parameters);

        const contextNames = ['webgl2', 'webgl', 'experimental-webgl'];
        this.gl = getContext(this._canvas, contextNames, parameters) as WebGLRenderingContext;
        this._initGLContext();
    }

    render(renderAtomic: RenderAtomic, first?: number, count?: number)
    {
        if (this._isContextLost === true) return;

        const { bindingStates, renderParams } = this;

        const instanceCount = renderAtomic.getInstanceCount();
        if (instanceCount === 0) return;
        const shaderMacro = renderAtomic.getShaderMacro();
        const shader = renderAtomic.getShader();
        shader.shaderMacro = shaderMacro;
        const shaderResult = this.shaders.activeShaderProgram(shader);
        if (!shaderResult)
        {
            console.warn(`缺少着色器，无法渲染!`);

            return;
        }
        //
        this.gl.useProgram(shaderResult.program);

        renderParams.updateRenderParams(renderAtomic.getRenderParams());

        bindingStates.setup(renderAtomic);

        this.uniforms.activeUniforms(renderAtomic, shaderResult.uniforms);

        this.draw(renderAtomic, first, count);
    }

    /**
     */
    private draw(renderAtomic: RenderAtomic, offset?: number, count?: number)
    {
        if (offset === undefined)
        {
            offset = 0;
        }

        const { gl, elementBufferRenderer: indexedBufferRenderer, bufferRenderer } = this;

        const instanceCount = ~~lazy.getValue(renderAtomic.getInstanceCount());
        const renderMode = gl[renderAtomic.getRenderParams().renderMode];

        indexedBufferRenderer.render(renderAtomic, renderMode, offset, count, instanceCount);
    }

    dipose()
    {
        this._canvas.removeEventListener('webglcontextlost', this._onContextLost, false);
        this._canvas.removeEventListener('webglcontextrestored', this._onContextRestore, false);
        this._canvas.removeEventListener('webglcontextcreationerror', this._onContextCreationError, false);
    }

    private _initGLContext()
    {
        this.extensions = new WebGLExtensions(this.gl);

        this.capabilities = new WebGLCapabilities(this.gl, this.extensions);
        this.extensions.init(this.capabilities);
        this.info = new WebGLInfo(this.gl);
        this.cacheStates = new WebGLCacheStates(this.gl);
        this.shaders = new WebGLShaders(this.gl);
        this.textures = new WebGLTextures(this.gl, this.extensions, this.capabilities);
        this.state = new WebGLState(this.gl, this.extensions, this.capabilities);
        this.attributes = new WebGLAttributes(this.gl, this.capabilities);

        this.bufferRenderer = new WebGLBufferRenderer(this);
        this.elementBufferRenderer = new WebGLElementBufferRenderer(this);

        this.bindingStates = new WebGLBindingStates(this.gl, this.extensions, this.attributes, this.elementBufferRenderer, this.capabilities, this.shaders);
        this.renderParams = new WebGLRenderParams(this.gl, this.capabilities, this.state);
        this.uniforms = new WebGLUniforms(this.gl, this.textures);
        this.renderbuffers = new WebGLRenderbuffers(this.gl);
        this.framebuffers = new WebGLFramebuffers(this.gl);
    }

    private _isContextLost = false;
    private _onContextLost = (event: Event) =>
    {
        event.preventDefault();

        console.log('WebGLRenderer: Context Lost.');

        this._isContextLost = true;
    };

    private _onContextRestore = () =>
    {
        console.log('WebGLRenderer: Context Restored.');

        this._isContextLost = false;

        this._initGLContext();
    };

    private _onContextCreationError = (event: WebGLContextEvent) =>
    {
        console.error('WebGLRenderer: A WebGL context could not be created. Reason: ', event.statusMessage);
    };
}

function getContext(canvas: HTMLCanvasElement, contextNames: string[], contextAttributes?: Partial<WebGLContextAttributes>)
{
    const context = _getContext(canvas, contextNames, contextAttributes);

    if (!context)
    {
        if (_getContext(canvas, contextNames))
        {
            throw new Error('Error creating WebGL context with your selected attributes.');
        }
        else
        {
            throw new Error('Error creating WebGL context.');
        }
    }

    return context;
}

function _getContext(canvas: HTMLCanvasElement, contextNames: string[], contextAttributes?: Partial<WebGLContextAttributes>)
{
    let context: RenderingContext;
    for (let i = 0; i < contextNames.length; ++i)
    {
        context = canvas.getContext(contextNames[i], contextAttributes);
        if (context) return context;
    }

    return null;
}
