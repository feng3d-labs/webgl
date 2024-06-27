import { watcher } from "@feng3d/watcher";
import { getDrawCall } from "../caches/getDrawCall";
import { DrawElementType, ElementBuffer, ElementBufferSourceTypes } from "../data/ElementBuffer";
import { RenderAtomic } from "../data/RenderAtomic";
import { WebGLAttributeBuffers } from "./WebGLAttributeBuffers";
import { BufferUsage } from "./WebGLEnums";

declare global
{
    interface WebGLRenderingContextExt
    {
        _elementBuffers: WebGLElementBuffers;
    }
}

export class WebGLElementBuffers
{
    private buffers = new WeakMap<ElementBuffer, WebGLElementBuffer>();

    private gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._elementBuffers = this;
    }

    render(renderAtomic: RenderAtomic)
    {
        const gl = this.gl;
        const { _attributeBuffers, _info } = this.gl;

        const drawCall = getDrawCall(renderAtomic.drawCall);

        let instanceCount = drawCall.instanceCount;
        const drawMode = drawCall.drawMode;
        let offset = drawCall.offset;
        let count = drawCall.count;

        const element = renderAtomic.index;

        let bytesPerElement: number;
        let vertexNum: number;
        let type: DrawElementType;

        if (element)
        {
            const elementCache = this.get(element);
            bytesPerElement = elementCache.bytesPerElement;
            vertexNum = elementCache.count;
            type = elementCache.type;
        }
        else
        {
            vertexNum = getAttributeVertexNum(_attributeBuffers, renderAtomic);

            if (vertexNum === 0)
            {
                // console.warn(`顶点数量为0，不进行渲染！`);

                // return;
                vertexNum = 6;
            }
        }

        if (offset === undefined)
        {
            offset = 0;
        }

        if (count === undefined)
        {
            count = vertexNum - offset;
        }

        if (instanceCount > 1)
        {
            if (element)
            {
                if (gl instanceof WebGL2RenderingContext)
                {
                    gl.drawElementsInstanced(gl[drawMode], count, gl[type], offset, instanceCount);
                }
                else
                {
                    const extension = gl.getExtension("ANGLE_instanced_arrays");
                    extension.drawElementsInstancedANGLE(gl[drawMode], count, gl[type], offset, instanceCount);
                }
            }
            else if (gl instanceof WebGL2RenderingContext)
            {
                gl.drawArraysInstanced(gl[drawMode], offset, count, instanceCount);
            }
            else
            {
                const extension = gl.getExtension("ANGLE_instanced_arrays");
                extension.drawArraysInstancedANGLE(gl[drawMode], offset, count, instanceCount);
            }
        }
        else
        {
            if (element)
            {
                gl.drawElements(gl[drawMode], count, gl[type], offset * bytesPerElement);
            }
            else
            {
                gl.drawArrays(gl[drawMode], offset, count);
            }
            instanceCount = 1;
        }

        _info.update(count, drawMode, instanceCount);
    }

    bindBuffer(element: ElementBuffer)
    {
        const { gl } = this;

        if (element)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.get(element).buffer);
        }
    }

    get(element: ElementBuffer)
    {
        const buffers = this.buffers;

        let data = buffers.get(element);

        if (data === undefined)
        {
            data = new WebGLElementBuffer(this.gl, element);
            buffers.set(element, data);
        }

        data.updateBuffer();

        return data;
    }

    remove(element: ElementBuffer)
    {
        const { buffers } = this;

        const data = buffers.get(element);

        if (data)
        {
            data.dispose();

            buffers.delete(element);
        }
    }
}

/**
 * WebGL元素数组缓冲，用于处理每个 ElementBuffer 向WebGL上传数据。
 */
class WebGLElementBuffer
{
    //
    element: ElementBuffer;
    buffer: WebGLBuffer;

    /**
     * 元素数据类型
     */
    type: DrawElementType;

    /**
     * 每个元素占用字符数量
     */
    bytesPerElement: number;

    /**
     * 元素数组长度
     */
    count: number;

    version = -1;

    private gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext, element: ElementBuffer)
    {
        this.gl = gl;
        this.element = element;

        //
        watcher.watch(element, "array", this.needsUpdate, this);
    }

    private needsUpdate()
    {
        this.element.version += ~~this.element.version;
    }

    updateBuffer()
    {
        const { gl } = this;
        const { element } = this;

        if (this.version === element.version)
        {
            return;
        }
        this.version = element.version;

        // 删除过时的缓冲
        let buffer = this.buffer;
        if (buffer)
        {
            gl.deleteBuffer(buffer);
        }

        //
        const { type, array } = transfromArrayType(element.array, element.type);
        const usage: BufferUsage = element.usage || "STATIC_DRAW";

        buffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl[usage]);

        this.type = type;
        this.count = array.length;
        this.bytesPerElement = array.BYTES_PER_ELEMENT;
        this.buffer = buffer;
    }

    dispose()
    {
        const { gl } = this;
        const { buffer, element } = this;

        gl.deleteBuffer(buffer);

        watcher.unwatch(element, "array", this.needsUpdate, this);

        this.gl = null;
        this.element = null;
        this.buffer = null;
    }
}

function transfromArrayType(array: ElementBufferSourceTypes, type?: DrawElementType)
{
    // 处理 type
    if (type === undefined)
    {
        if (array instanceof Uint8Array)
        {
            type = "UNSIGNED_BYTE";
        }
        else if (array instanceof Uint16Array)
        {
            type = "UNSIGNED_SHORT";
        }
        else if (array instanceof Uint32Array)
        {
            type = "UNSIGNED_INT";
        }
        else
        {
            type = "UNSIGNED_SHORT";
        }
    }

    // 处理数组
    if (Array.isArray(array))
    {
        if (type === "UNSIGNED_BYTE")
        {
            array = new Uint8Array(array);
        }
        else if (type === "UNSIGNED_INT")
        {
            array = new Uint32Array(array);
        }
        else if (type === "UNSIGNED_SHORT")
        {
            array = new Uint16Array(array);
        }
        else
        {
            throw `未知元素缓冲数据类型 ${type}`;
        }
    }

    // 处理数据类型不匹配情况
    if (type === "UNSIGNED_BYTE")
    {
        if (!(array instanceof Uint8Array))
        {
            array = new Uint8Array(array);
        }
    }
    else if (type === "UNSIGNED_SHORT")
    {
        if (!(array instanceof Uint16Array))
        {
            array = new Uint16Array(array);
        }
    }
    else if (type === "UNSIGNED_INT")
    {
        if (!(array instanceof Uint32Array))
        {
            array = new Uint32Array(array);
        }
    }
    else
    {
        throw `未知元素缓冲数据类型 ${type}`;
    }

    return { array, type };
}

/**
 * 获取属性顶点属性。
 *
 * @param attributes
 * @returns
 */
function getAttributeVertexNum(attributes: WebGLAttributeBuffers, renderAtomic: RenderAtomic)
{
    const vertexNum = ((attributelist) =>
    {
        for (const attr in attributelist)
        {
            // eslint-disable-next-line no-prototype-builtins
            if (attributelist.hasOwnProperty(attr))
            {
                const attribute = attributes.get(attributelist[attr]);

                return attribute.count;
            }
        }

        return 0;
    })(renderAtomic.attributes);

    return vertexNum;
}