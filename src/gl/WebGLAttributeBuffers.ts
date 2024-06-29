import { watcher } from "@feng3d/watcher";
import { AttributeBuffer, AttributeBufferSourceTypes, VertexAttributeTypes } from "../data/AttributeBuffer";

declare global
{
    interface WebGLRenderingContextExt
    {
        _attributeBuffers: WebGLAttributeBuffers;
    }
}

export class WebGLAttributeBuffers
{
    private buffers = new WeakMap<AttributeBuffer, WebGLAttributeBuffer>();

    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._attributeBuffers = this;
    }

    get(attribute: AttributeBuffer)
    {
        const { buffers } = this;

        return buffers.get(attribute);
    }

    remove(attribute: AttributeBuffer)
    {
        const { buffers } = this;

        const data = buffers.get(attribute);

        if (data)
        {
            data.dispose();

            buffers.delete(attribute);
        }
    }

    update(attribute: AttributeBuffer)
    {
        const { buffers } = this;

        let data = buffers.get(attribute);

        if (data === undefined)
        {
            data = new WebGLAttributeBuffer(this.gl, attribute);
            buffers.set(attribute, data);
        }
        data.updateBuffer();
    }

    vertexAttribPointer(location: number, attribute: AttributeBuffer)
    {
        const { gl } = this;

        const attributeBufferCacle = this.get(attribute);

        const size = attribute.itemSize;
        const buffer = attributeBufferCacle.buffer;
        const type = attributeBufferCacle.type;
        const bytesPerElement = attributeBufferCacle.bytesPerElement;
        const normalized = attributeBufferCacle.normalized;

        const stride = size * bytesPerElement;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        if (gl instanceof WebGL2RenderingContext && (type === "INT" || type === "UNSIGNED_INT"))
        {
            gl.vertexAttribIPointer(location, size, gl[type], stride, offset);
        }
        else
        {
            gl.vertexAttribPointer(location, size, gl[type], normalized, stride, offset);
        }
    }
}

export class WebGLAttributeBuffer
{
    //
    attribute: AttributeBuffer;
    buffer: WebGLBuffer;

    type: VertexAttributeTypes;

    /**
     * 数据数量
     */
    count: number;

    /**
     * 是否标准化。
     */
    normalized: boolean;

    bytesPerElement: number;
    version = -1;

    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, attribute: AttributeBuffer)
    {
        this.gl = gl;

        this.attribute = attribute;

        //
        watcher.watch(attribute.buffer, "data", this.needsUpdate, this);
    }

    private needsUpdate()
    {
        this.attribute.version = ~~this.attribute.version + 1;
    }

    updateBuffer()
    {
        const { gl } = this;
        const { attribute } = this;

        if (this.version === attribute.version)
        {
            return;
        }
        this.version = attribute.version;

        // 删除过时的缓冲
        let buffer = this.buffer;
        if (buffer)
        {
            gl.deleteBuffer(buffer);
        }

        const { type, array } = transfromArrayType(attribute.buffer.data, attribute.type);
        const usage = attribute.buffer.usage || "STATIC_DRAW";
        const count = array !== undefined ? array.length / attribute.itemSize : 0;
        const normalized = attribute.normalized === true;

        buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl[usage]);

        this.buffer = buffer;
        this.type = type;
        this.count = count;
        this.normalized = normalized;
        this.bytesPerElement = array.BYTES_PER_ELEMENT;
    }

    dispose()
    {
        const { gl } = this;
        const { buffer, attribute } = this;

        gl.deleteBuffer(buffer);

        watcher.watch(attribute.buffer, "data", this.needsUpdate, this);

        this.gl = null;
        this.attribute = null;
        this.buffer = null;
    }
}

function transfromArrayType(array: AttributeBufferSourceTypes, type: VertexAttributeTypes)
{
    // 处理 type
    if (type === undefined)
    {
        if (array instanceof Float32Array)
        {
            type = "FLOAT";
        }
        else if (array instanceof Uint32Array)
        {
            type = "UNSIGNED_INT";
        }
        else if (array instanceof Int32Array)
        {
            type = "INT";
        }
        else if (array instanceof Uint16Array)
        {
            type = "UNSIGNED_SHORT";
        }
        else if (array instanceof Int16Array)
        {
            type = "SHORT";
        }
        else if (array instanceof Uint8Array)
        {
            type = "UNSIGNED_BYTE";
        }
        else if (array instanceof Int8Array || array instanceof Uint8ClampedArray)
        {
            type = "BYTE";
        }
        else
        {
            type = "FLOAT";
        }
    }

    // 处理数组
    if (Array.isArray(array))
    {
        if (type === "FLOAT")
        {
            array = new Float32Array(array);
        }
        else if (type === "UNSIGNED_INT")
        {
            array = new Uint32Array(array);
        }
        else if (type === "INT")
        {
            array = new Int32Array(array);
        }
        else if (type === "UNSIGNED_SHORT")
        {
            array = new Uint16Array(array);
        }
        else if (type === "SHORT")
        {
            array = new Int16Array(array);
        }
        else if (type === "UNSIGNED_BYTE")
        {
            array = new Uint8Array(array);
        }
        else if (type === "BYTE")
        {
            array = new Int8Array(array);
        }
        else
        {
            throw `未知元素缓冲区数据类型 ${type}`;
        }
    }

    // 处理数据类型不匹配情况
    if (type === "FLOAT")
    {
        if (!(array instanceof Float32Array))
        {
            array = new Float32Array(array);
        }
    }
    else if (type === "UNSIGNED_INT")
    {
        if (!(array instanceof Uint32Array))
        {
            array = new Uint32Array(array);
        }
    }
    else if (type === "INT")
    {
        if (!(array instanceof Int32Array))
        {
            array = new Int32Array(array);
        }
    }
    else if (type === "UNSIGNED_SHORT")
    {
        if (!(array instanceof Uint16Array))
        {
            array = new Uint16Array(array);
        }
    }
    else if (type === "SHORT")
    {
        if (!(array instanceof Uint16Array))
        {
            array = new Int16Array(array);
        }
    }
    else if (type === "BYTE")
    {
        if (!(array instanceof Int8Array))
        {
            array = new Int8Array(array);
        }
    }
    else if (type === "UNSIGNED_BYTE")
    {
        if (!(array instanceof Uint8Array || array instanceof Uint8ClampedArray))
        {
            array = new Uint8Array(array);
        }
    }
    else
    {
        throw `未知元素缓冲区数据类型 ${type}`;
    }

    return { array, type };
}
