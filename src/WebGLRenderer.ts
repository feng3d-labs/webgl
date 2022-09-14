/* eslint-disable no-new */
import { lazy } from '@feng3d/polyfill';
import { BufferAttribute } from './data/BufferAttribute';
import { RenderAtomic } from './data/RenderAtomic';
import { WebGLBindingStates } from './gl/WebGLBindingStates';
import { WebGLBufferRenderer } from './gl/WebGLBufferRenderer';
import { WebGLCache } from './gl/WebGLCache';
import { WebGLCacheStates } from './gl/WebGLCacheStates';
import { WebGLCapabilities } from './gl/WebGLCapabilities';
import { WebGLExtensions } from './gl/WebGLExtensions';
import { WebGLIndexedBufferRenderer } from './gl/WebGLIndexedBufferRenderer';
import { WebGLInfo } from './gl/WebGLInfo';
import { WebGLProperties } from './gl/WebGLProperties';
import { WebGLRenderParams } from './gl/WebGLRenderParams';
import { WebGLShaders } from './gl/WebGLShaders';
import { WebGLState } from './gl/WebGLState';
import { WebGLTextures } from './gl/WebGLTextures';
import { WebGLUniforms } from './gl/WebGLUniforms';
import { WebGLAttributes } from './WebGLAttributes';

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
    properties: WebGLProperties;

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

    cache: WebGLCache;
    /**
     * 缓存WebGL状态
     */
    cacheStates: WebGLCacheStates;
    shaders: WebGLShaders;
    state: WebGLState;
    bindingStates: WebGLBindingStates;
    attributes: WebGLAttributes;
    bufferRenderer: WebGLBufferRenderer;
    indexedBufferRenderer: WebGLIndexedBufferRenderer;
    renderParams: WebGLRenderParams;

    uniforms: WebGLUniforms;

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

    render(renderAtomic: RenderAtomic)
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

        this.draw(renderAtomic);
    }

    /**
     */
    private draw(renderAtomic: RenderAtomic)
    {
        const { gl, attributes, indexedBufferRenderer, bufferRenderer } = this;

        const instanceCount = ~~lazy.getValue(renderAtomic.getInstanceCount());
        const renderMode = gl[renderAtomic.getRenderParams().renderMode];

        const index = renderAtomic.getIndexBuffer();
        if (index)
        {
            const attribute = attributes.get(index);
            indexedBufferRenderer.setIndex(attribute);

            indexedBufferRenderer.setMode(renderMode);

            if (instanceCount > 1)
            {
                indexedBufferRenderer.renderInstances(0, index.count, instanceCount);
            }
            else
            {
                indexedBufferRenderer.render(0, index.count);
            }
        }
        else
        {
            let vertexNum = ((attributes) =>
            {
                for (const attr in attributes)
                {
                    // eslint-disable-next-line no-prototype-builtins
                    if (attributes.hasOwnProperty(attr))
                    {
                        const attribute: BufferAttribute = attributes[attr];

                        return attribute.count;
                    }
                }

                return 0;
            })(renderAtomic.getAttributes());
            if (vertexNum === 0)
            {
                // console.warn(`顶点数量为0，不进行渲染！`);

                // return;
                vertexNum = 6;
            }

            bufferRenderer.setMode(renderMode);

            if (instanceCount > 1)
            {
                bufferRenderer.renderInstances(0, vertexNum, instanceCount);
            }
            else
            {
                bufferRenderer.render(0, vertexNum);
            }
        }
    }

    dipose()
    {
        this._canvas.removeEventListener('webglcontextlost', this._onContextLost, false);
        this._canvas.removeEventListener('webglcontextrestored', this._onContextRestore, false);
        this._canvas.removeEventListener('webglcontextcreationerror', this._onContextCreationError, false);

        this.properties.dispose();
    }

    private _initGLContext()
    {
        this.extensions = new WebGLExtensions(this.gl);

        this.capabilities = new WebGLCapabilities(this.gl, this.extensions);
        this.extensions.init(this.capabilities);
        this.cache = new WebGLCache(this.gl);
        this.cacheStates = new WebGLCacheStates(this.gl);
        this.shaders = new WebGLShaders(this.gl);
        this.properties = new WebGLProperties();
        this.textures = new WebGLTextures(this.gl, this.extensions, this.capabilities, this.properties);
        this.state = new WebGLState(this.gl, this.extensions, this.capabilities);
        this.attributes = new WebGLAttributes(this.gl, this.capabilities);
        this.info = new WebGLInfo(this.gl);
        this.bindingStates = new WebGLBindingStates(this.gl, this.extensions, this.attributes, this.capabilities, this.shaders);
        this.renderParams = new WebGLRenderParams(this.gl, this.capabilities, this.state);
        this.uniforms = new WebGLUniforms(this.gl, this.textures, this.cache);

        this.bufferRenderer = new WebGLBufferRenderer(this.gl, this.extensions, this.info, this.capabilities);
        this.indexedBufferRenderer = new WebGLIndexedBufferRenderer(this.gl, this.extensions, this.info, this.capabilities);
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
