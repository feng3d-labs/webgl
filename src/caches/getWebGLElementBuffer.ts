import { watcher } from "@feng3d/watcher";
import { DrawElementType, ElementBuffer, ElementBufferSourceTypes } from "../data/ElementBuffer";
import { BufferUsage } from "../gl/WebGLEnums";

declare global
{
    interface WebGLRenderingContextExt
    {
    }
}

const buffers = new WeakMap<ElementBuffer, WebGLElementBuffer>();

export function getWebGLElementBuffer(gl: WebGLRenderingContext, element: ElementBuffer)
{
    let data = buffers.get(element);

    if (data === undefined)
    {
        data = new WebGLElementBuffer(gl, element);
        buffers.set(element, data);
    }

    data.updateBuffer();

    return data;
}

function remove(element: ElementBuffer)
{
    const data = buffers.get(element);

    if (data)
    {
        data.dispose();

        buffers.delete(element);
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
