import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { getElementWebGLBuffer } from "../caches/getWebGLElementBuffer";
import { IIndexBuffer } from "../data/IIndexBuffer";
import { IRenderObject } from "../data/IRenderObject";
import { IVertexAttribute } from "../data/IVertexAttribute";

declare global
{
    interface WebGLRenderingContextExt
    {
        _bindingStates: WebGLBindingStates;
    }
}

export class WebGLBindingStates
{
    private currentState: BindingState;
    private defaultState: BindingState;
    private bindingStates = new WeakMap<IRenderObject, BindingState>();

    private gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._bindingStates = this;

        //
        this.defaultState = this.createBindingState(null);
        this.currentState = this.defaultState;
    }

    setup(renderAtomic: IRenderObject)
    {
        const gl = this.gl;

        let updateBuffers = false;

        if (gl._capabilities.vaoAvailable)
        {
            const state = this.getBindingState(renderAtomic);
            if (this.currentState !== state)
            {
                this.currentState = state;
                this.bindVertexArrayObject(this.currentState.vao);
            }
            updateBuffers = this.needsUpdate(renderAtomic);

            if (updateBuffers) this.saveCache(renderAtomic);
        }
        else if (this.currentState.renderAtomic !== renderAtomic)
        {
            this.currentState.renderAtomic = renderAtomic;

            updateBuffers = true;
        }

        if (updateBuffers)
        {
            this.setupVertexAttributes(renderAtomic);

            //
            if (renderAtomic.index)
            {
                const buffer = getElementWebGLBuffer(gl, renderAtomic.index);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            }
        }
    }

    /**
     * 判断是否需要更新。
     *
     * @param renderAtomic 渲染原子。
     * @returns 是否需要更新。
     */
    private needsUpdate(renderAtomic: IRenderObject)
    {
        const { currentState } = this;

        const cachedAttributes = currentState.attributes;

        const shaderResult = getCompileShaderResult(this.gl, renderAtomic.pipeline.vertex.code, renderAtomic.pipeline.fragment.code);
        const attributeInfos = shaderResult.attributes;

        let attributesNum = 0;

        for (const name in attributeInfos)
        {
            const attributeInfo = attributeInfos[name];

            if (attributeInfo.location >= 0)
            {
                const cachedAttribute = cachedAttributes[name];
                const attribute = renderAtomic.attributes[name];

                if (cachedAttribute === undefined) return true;

                if (cachedAttribute.attribute !== attribute) return true;

                attributesNum++;
            }
        }

        if (currentState.attributesNum !== attributesNum) return true;

        const index = renderAtomic.index;
        if (currentState.index !== index) return true;

        return false;
    }

    /**
     * 保存缓存。
     *
     * @param renderAtomic 渲染原子。
     */
    private saveCache(renderAtomic: IRenderObject)
    {
        const { currentState } = this;

        const cache: { [key: string]: { version: number, attribute: IVertexAttribute } } = {};
        let attributesNum = 0;

        const shaderResult = getCompileShaderResult(this.gl, renderAtomic.pipeline.vertex.code, renderAtomic.pipeline.fragment.code);
        const attributeInfos = shaderResult.attributes;

        for (const name in attributeInfos)
        {
            const programAttribute = attributeInfos[name];

            if (programAttribute.location >= 0)
            {
                const attribute = renderAtomic.attributes[name];

                const data: { version: number, attribute: IVertexAttribute } = {} as any;
                data.attribute = attribute;

                cache[name] = data;

                attributesNum++;
            }
        }

        currentState.attributes = cache;
        currentState.attributesNum = attributesNum;

        const index = renderAtomic.index;
        currentState.index = index;
    }

    /**
     * 设置顶点属性。
     *
     * @param renderAtomic 渲染原子。
     */
    private setupVertexAttributes(renderAtomic: IRenderObject)
    {
        const { _attributeBuffers } = this.gl;

        this.initAttributes();

        const shaderResult = getCompileShaderResult(this.gl, renderAtomic.pipeline.vertex.code, renderAtomic.pipeline.fragment.code);

        for (const name in shaderResult.attributes)
        {
            const activeInfo = shaderResult.attributes[name];
            const location = activeInfo.location;
            // 处理 WebGL 内置属性 gl_VertexID 等
            if (location < 0)
            {
                continue;
            }

            const attribute = renderAtomic.attributes[name];

            this.enableAttribute(location, attribute.divisor);

            _attributeBuffers.vertexAttribPointer(location, attribute);
        }

        this.disableUnusedAttributes();
    }

    /**
     * 绑定顶点数组对象。
     *
     * @param vao 顶点数组对象。
     */
    private bindVertexArrayObject(vao: WebGLVertexArrayObject)
    {
        const { gl } = this;

        if (gl instanceof WebGL2RenderingContext) return gl.bindVertexArray(vao);

        const extension = gl.getExtension("OES_vertex_array_object");
        extension.bindVertexArrayOES(vao);
    }

    /**
     * 启用属性。
     *
     * @param location 指向要激活的顶点属性。
     * @param divisor drawElementsInstanced时将会用到的因子，表示divisor个geometry共用一个数据。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor
     */
    enableAttribute(location: number, divisor?: number)
    {
        const { gl } = this;
        const { currentState } = this;
        divisor = ~~divisor;

        //
        const newAttributes = currentState.newAttributes;
        const enabledAttributes = currentState.enabledAttributes;
        const attributeDivisors = currentState.attributeDivisors;

        newAttributes[location] = 1;

        if (enabledAttributes[location] === 0)
        {
            gl.enableVertexAttribArray(location);
            enabledAttributes[location] = 1;
        }

        if (attributeDivisors[location] !== divisor)
        {
            const { gl } = this;

            if (gl instanceof WebGL2RenderingContext)
            {
                gl.vertexAttribDivisor(location, divisor);
            }
            else
            {
                const extension = gl.getExtension("ANGLE_instanced_arrays");
                extension.vertexAttribDivisorANGLE(location, divisor);
            }
            attributeDivisors[location] = divisor;
        }
    }

    /**
     * 初始化WebGL属性使用情况
     */
    initAttributes()
    {
        const { currentState } = this;

        const newAttributes = currentState.newAttributes;

        for (let i = 0, il = newAttributes.length; i < il; i++)
        {
            newAttributes[i] = 0;
        }
    }

    /**
     * 关闭未使用的WebGL属性。
     */
    disableUnusedAttributes()
    {
        const { gl } = this;
        const { currentState } = this;

        const newAttributes = currentState.newAttributes;
        const enabledAttributes = currentState.enabledAttributes;

        for (let i = 0, il = enabledAttributes.length; i < il; i++)
        {
            if (enabledAttributes[i] !== newAttributes[i])
            {
                gl.disableVertexAttribArray(i);
                enabledAttributes[i] = 0;
            }
        }
    }

    /**
     * 获取对应的绑定状态。
     *
     * @param renderAtomic 渲染原子。
     * @returns 对应的绑定状态。
     */
    private getBindingState(renderAtomic: IRenderObject)
    {
        let bindingState = this.bindingStates.get(renderAtomic);
        if (!bindingState)
        {
            const vao = this.createVertexArrayObject();
            bindingState = this.createBindingState(vao);
            this.bindingStates.set(renderAtomic, bindingState);
        }

        return bindingState;
    }

    /**
     * 创建WebGL顶点数组对象。
     *
     * @returns WebGL顶点数组对象。
     */
    private createVertexArrayObject()
    {
        const { gl } = this;

        if (gl instanceof WebGL2RenderingContext)
        {
            return gl.createVertexArray();
        }

        const extension = gl.getExtension("OES_vertex_array_object");

        return extension.createVertexArrayOES();
    }

    /**
     * 创建绑定状态。
     *
     * @param vao WebGL顶点数组对象。
     * @returns 绑定状态。
     */
    private createBindingState(vao: WebGLVertexArrayObject)
    {
        const { gl } = this;
        const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        const bindingState = new BindingState(vao, maxVertexAttributes);

        return bindingState;
    }
}

/**
 * 绑定状态
 */
class BindingState
{
    renderAtomic: IRenderObject;

    /**
     * 最新启用的WebGL属性。
     */
    newAttributes: number[] = [];

    /**
     * 已启用的WebGL属性。
     */
    enabledAttributes: number[] = [];

    /**
     * WebGL属性对应的divisor值。
     */
    attributeDivisors: number[] = [];

    /**
     * WebGL顶点数组对象
     */
    vao: WebGLVertexArrayObject;

    /**
     * WebGL属性缓存信息
     */
    attributes: { [key: string]: { attribute: IVertexAttribute } } = {};

    /**
     * 顶点索引缓冲
     */
    index: IIndexBuffer;

    /**
     * 属性数量。
     */
    attributesNum: number;

    constructor(vao: WebGLVertexArrayObject, maxVertexAttributes: number)
    {
        this.vao = vao;

        for (let i = 0; i < maxVertexAttributes; i++)
        {
            this.newAttributes[i] = 0;
            this.enabledAttributes[i] = 0;
            this.attributeDivisors[i] = 0;
        }
    }
}

