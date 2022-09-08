import { Attribute } from '../data/Attribute';
import { RenderAtomic } from '../data/RenderAtomic';
import { GL } from './GL';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';

export class WebGLBindingStates
{
    private gl: GL;
    private extensions: WebGLExtensions;
    private capabilities: WebGLCapabilities;
    private currentState: BindingState;
    private defaultState: BindingState;

    private bindingStates = new WeakMap();

    constructor(gl: GL, extensions: WebGLExtensions, capabilities: WebGLCapabilities)
    {
        this.gl = gl;
        this.extensions = extensions;
        this.capabilities = capabilities;

        this.defaultState = this.createBindingState(null);
        this.currentState = this.defaultState;
    }

    setup(renderAtomic: RenderAtomic)
    {
        const { capabilities } = this;

        let updateBuffers = false;

        if (capabilities.vaoAvailable)
        {
            const state = this.getBindingState(renderAtomic);
            if (this.currentState !== state)
            {
                this.currentState = state;
                this.bindVertexArrayObject(this.currentState.object);
            }
            updateBuffers = true;
        }
        else
        {
            updateBuffers = true;
        }

        // if (index !== null)
        // {
        //     attributes.update(index, gl.ELEMENT_ARRAY_BUFFER);
        // }

        if (updateBuffers)
        {
            this.setupVertexAttributes(renderAtomic);

            // if (index !== null)
            // {
            //     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer);
            // }
        }
    }

    private setupVertexAttributes(renderAtomic: RenderAtomic)
    {
        const { gl, capabilities, extensions } = this;

        if (capabilities.isWebGL2 === false && renderAtomic.getInstanceCount() > 0)
        {
            if (extensions.get('ANGLE_instanced_arrays') === null) return;
        }

        this.initAttributes();

        const shader = renderAtomic.getShader();
        const shaderResult = shader.activeShaderProgram(this.gl);

        const activeAttributes: number[] = [];
        for (const name in shaderResult.attributes)
        {
            const activeInfo = shaderResult.attributes[name];
            const attribute: Attribute = renderAtomic.getAttributeByKey(name);

            this.enableAttribute(activeInfo.location, attribute.divisor);

            const buffer = attribute.getBuffer(gl);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(activeInfo.location, attribute.size, gl[attribute.type], attribute.normalized, attribute.stride, attribute.offset);

            activeAttributes.push(activeInfo.location);
        }

        this.disableUnusedAttributes();
    }

    private bindVertexArrayObject(vao: WebGLVertexArrayObject)
    {
        const { gl, extensions, capabilities } = this;

        if (capabilities.isWebGL2) return (gl as any as WebGL2RenderingContext).bindVertexArray(vao);

        const extension = extensions.get('OES_vertex_array_object');

        return extension.bindVertexArrayOES(vao);
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
    enableAttribute(location: number, divisor = 0)
    {
        const { gl, extensions, capabilities, currentState } = this;

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
            const extension = capabilities.isWebGL2 ? gl : extensions.get('ANGLE_instanced_arrays');

            extension[capabilities.isWebGL2 ? 'vertexAttribDivisor' : 'vertexAttribDivisorANGLE'](location, divisor);
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
        const { gl, currentState } = this;

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

    private getBindingState(renderAtomic: RenderAtomic)
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

    private createVertexArrayObject()
    {
        const { gl, extensions, capabilities } = this;

        if (capabilities.isWebGL2)
        {
            return (gl as any as WebGL2RenderingContext).createVertexArray();
        }

        const extension = extensions.get('OES_vertex_array_object');

        return extension.createVertexArrayOES();
    }

    private createBindingState(vao: WebGLVertexArrayObject)
    {
        const { gl } = this;
        const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        const bindingState = new BindingState(vao, maxVertexAttributes);

        return bindingState;
    }
}

class BindingState
{
    newAttributes = [];
    enabledAttributes = [];
    attributeDivisors = [];
    attributes = {};
    object: any;

    constructor(object: any, maxVertexAttributes: number)
    {
        this.newAttributes = [];
        this.enabledAttributes = [];
        this.attributeDivisors = [];
        this.object = object;

        for (let i = 0; i < maxVertexAttributes; i++)
        {
            this.newAttributes[i] = 0;
            this.enabledAttributes[i] = 0;
            this.attributeDivisors[i] = 0;
        }
    }
}
