import { watcher } from "@feng3d/watcher";
import { AttributeBufferSourceTypes, IBuffer } from "../data/IBuffer";
import { VertexAttributeTypes } from "../data/IVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _buffers: Map<IBuffer, WebGLBuffer>
    }

    interface WebGLBuffer
    {
        /**
         * 元素数据类型
         */
        type: VertexAttributeTypes;

        /**
         * 元素数组长度
         */
        count: number;

        bytesPerElement: number;

        /**
         * 销毁。
         */
        destroy: () => void;
    }
}

export function getWebGLBuffer(gl: WebGLRenderingContext, buffer: IBuffer, type?: VertexAttributeTypes)
{
    let webGLBuffer = gl._buffers.get(buffer);
    if (webGLBuffer) return webGLBuffer;

    webGLBuffer = gl.createBuffer();
    gl._buffers.set(buffer, webGLBuffer);

    const updateBuffer = () =>
    {
        const target = buffer.target || "ARRAY_BUFFER";
        // 获取
        webGLBuffer.type = type || getWebGLBufferType(buffer.data);
        const data = getArrayBufferViewWithType(buffer.data, webGLBuffer.type);

        // 上传数据到WebGL
        gl.bindBuffer(gl[target], webGLBuffer);
        gl.bufferData(gl[target], data, gl[buffer.usage || "STATIC_DRAW"]);

        //
        webGLBuffer.count = data.length;
        webGLBuffer.bytesPerElement = data.BYTES_PER_ELEMENT;
    };

    updateBuffer();

    //
    watcher.watch(buffer, "data", updateBuffer);

    //
    webGLBuffer.destroy = () =>
    {
        watcher.unwatch(buffer, "data", updateBuffer);
    };

    return webGLBuffer;
}

export function deleteBuffer(gl: WebGLRenderingContext, buffer: IBuffer)
{
    const webGLBuffer = gl._buffers.get(buffer);
    if (webGLBuffer)
    {
        gl._buffers.delete(buffer);
        webGLBuffer.destroy();
        delete webGLBuffer.destroy;
        //
        gl.deleteBuffer(webGLBuffer);
    }
}

function getWebGLBufferType(data: AttributeBufferSourceTypes)
{
    let type: VertexAttributeTypes;
    if (data instanceof Float32Array)
    {
        type = "FLOAT";
    }
    else if (data instanceof Uint32Array)
    {
        type = "UNSIGNED_INT";
    }
    else if (data instanceof Int32Array)
    {
        type = "INT";
    }
    else if (data instanceof Uint16Array)
    {
        type = "UNSIGNED_SHORT";
    }
    else if (data instanceof Int16Array)
    {
        type = "SHORT";
    }
    else if (data instanceof Uint8Array)
    {
        type = "UNSIGNED_BYTE";
    }
    else if (data instanceof Int8Array || data instanceof Uint8ClampedArray)
    {
        type = "BYTE";
    }
    else
    {
        type = "FLOAT";
    }

    return type;
}

export function getArrayBufferViewWithType(array: AttributeBufferSourceTypes, type: VertexAttributeTypes)
{
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

    return array;
}
