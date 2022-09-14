/* eslint-disable no-new */
import { lazy } from '@feng3d/polyfill';
import { BufferAttribute } from './data/BufferAttribute';
import { RenderAtomic, RenderAtomicData } from './data/RenderAtomic';
import { UniformInfo } from './data/Shader';
import { Texture } from './data/Texture';
import { Uniforms } from './data/Uniform';
import { WebGLBindingStates } from './gl/WebGLBindingStates';
import { WebGLBufferRenderer } from './gl/WebGLBufferRenderer';
import { WebGLCache } from './gl/WebGLCache';
import { WebGLCapabilities } from './gl/WebGLCapabilities';
import { WebGLExtensions } from './gl/WebGLExtensions';
import { WebGLIndexedBufferRenderer } from './gl/WebGLIndexedBufferRenderer';
import { WebGLInfo } from './gl/WebGLInfo';
import { WebGLProperties } from './gl/WebGLProperties';
import { WebGLRenderParams } from './gl/WebGLRenderParams';
import { WebGLState } from './gl/WebGLState';
import { WebGLTextures } from './gl/WebGLTextures';
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

    static glList: WebGLRenderingContext[] = [];

    gl: WebGLRenderingContext;

    extensions: WebGLExtensions;
    properties: WebGLProperties;
    capabilities: WebGLCapabilities;
    textures: WebGLTextures;
    info: WebGLInfo;
    state: WebGLState;
    bindingStates: WebGLBindingStates;
    attributes: WebGLAttributes;
    bufferRenderer: WebGLBufferRenderer;
    indexedBufferRenderer: WebGLIndexedBufferRenderer;
    cache: WebGLCache;
    renderParams: WebGLRenderParams;

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
        } as Partial<WebGLRendererParameters>, parameters);

        const contextNames = ['webgl2', 'webgl', 'experimental-webgl'];
        const gl = getContext(this._canvas, contextNames, parameters) as WebGLRenderingContext;
        this.gl = gl;
        this._initGLContext();
        //
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        WebGLRenderer.glList.push(gl);
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
        const shaderResult = shader.activeShaderProgram(this.gl, this.cache);
        if (!shaderResult) return;
        //
        const checkedRenderAtomic: RenderAtomicData = this.checkRenderData(renderAtomic);
        if (!checkedRenderAtomic) return;
        //
        this.gl.useProgram(shaderResult.program);

        renderParams.updateRenderParams(checkedRenderAtomic.renderParams);

        bindingStates.setup(renderAtomic);

        this.activeUniforms(checkedRenderAtomic, shaderResult.uniforms);
        this.draw(renderAtomic, checkedRenderAtomic);
    }

    private checkRenderData(renderAtomic: RenderAtomic)
    {
        const shader = renderAtomic.getShader();
        const shaderResult = shader.activeShaderProgram(this.gl, this.cache);
        if (!shaderResult)
        {
            console.warn(`缺少着色器，无法渲染!`);

            return null;
        }

        const attributes: { [name: string]: BufferAttribute; } = {};
        for (const key in shaderResult.attributes)
        {
            // 处理 WebGL 内置属性 gl_VertexID 等
            if (shaderResult.attributes[key].location < 0)
            {
                continue;
            }
            const attribute = renderAtomic.getAttributeByKey(key);
            if (!attribute)
            {
                console.warn(`缺少顶点 attribute 数据 ${key} ，无法渲染!`);

                return null;
            }
            attributes[key] = attribute;
        }

        const uniforms: { [name: string]: Uniforms; } = {};
        for (let key in shaderResult.uniforms)
        {
            const activeInfo = shaderResult.uniforms[key];
            if (activeInfo.name)
            {
                key = activeInfo.name;
            }
            const uniform = renderAtomic.getUniformByKey(key);
            if (uniform === undefined)
            {
                console.warn(`缺少 uniform 数据 ${key} ,无法渲染！`);

                return null;
            }
            uniforms[key] = uniform;
        }

        const indexBuffer = renderAtomic.getIndexBuffer();

        const checkedRenderAtomic: RenderAtomicData
            = {
            shader,
            attributes,
            uniforms,
            renderParams: renderAtomic.getRenderParams(),
            index: indexBuffer,
            instanceCount: renderAtomic.getInstanceCount(),
        };

        return checkedRenderAtomic;
    }

    /**
     * 激活常量
     */
    private activeUniforms(renderAtomic: RenderAtomicData, uniformInfos: { [name: string]: UniformInfo })
    {
        const uniforms = renderAtomic.uniforms;
        for (const name in uniformInfos)
        {
            const activeInfo = uniformInfos[name];
            const paths = activeInfo.paths;
            let uniformData = uniforms[paths[0]];
            for (let i = 1; i < paths.length; i++)
            {
                uniformData = uniformData[paths[i]];
            }
            this.setContext3DUniform(activeInfo, uniformData);
        }
    }

    /**
     * 设置环境Uniform数据
     */
    private setContext3DUniform(activeInfo: UniformInfo, data)
    {
        const { gl, textures, cache } = this;

        let vec: number[] = data;
        if (data.toArray) vec = data.toArray();
        const location = activeInfo.location;
        switch (activeInfo.type)
        {
            case gl.BOOL:
            case gl.INT:
                gl.uniform1i(location, data);
                break;
            case gl.FLOAT_MAT3:
                gl.uniformMatrix3fv(location, false, vec);
                break;
            case gl.FLOAT_MAT4:
                gl.uniformMatrix4fv(location, false, vec);
                break;
            case gl.FLOAT:
                gl.uniform1f(location, data);
                break;
            case gl.FLOAT_VEC2:
                gl.uniform2f(location, vec[0], vec[1]);
                break;
            case gl.FLOAT_VEC3:
                gl.uniform3f(location, vec[0], vec[1], vec[2]);
                break;
            case gl.FLOAT_VEC4:
                gl.uniform4f(location, vec[0], vec[1], vec[2], vec[3]);
                break;
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                const textureInfo = data as Texture;
                // 激活纹理编号
                gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);
                textures.active(textureInfo, cache);
                // 设置纹理所在采样编号
                gl.uniform1i(location, activeInfo.textureID);
                break;
                break;
            default:
                console.error(`无法识别的uniform类型 ${activeInfo.name} ${data}`);
        }
    }

    /**
     */
    private draw(renderAtomic: RenderAtomic, renderAtomicData: RenderAtomicData)
    {
        const { gl, attributes, indexedBufferRenderer, bufferRenderer } = this;

        const instanceCount = ~~lazy.getValue(renderAtomicData.instanceCount);
        const renderMode = gl[renderAtomicData.renderParams.renderMode];

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
            })(renderAtomicData.attributes);
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
        this.properties = new WebGLProperties();
        this.textures = new WebGLTextures(this.gl, this.extensions, this.capabilities, this.properties);
        this.state = new WebGLState(this.gl, this.extensions, this.capabilities);
        this.attributes = new WebGLAttributes(this.gl, this.capabilities);
        this.info = new WebGLInfo(this.gl);
        this.bindingStates = new WebGLBindingStates(this.gl, this.extensions, this.attributes, this.capabilities, this.cache);
        this.renderParams = new WebGLRenderParams(this.gl, this.capabilities, this.state);

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
