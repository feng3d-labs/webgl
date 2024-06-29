import { watcher } from "@feng3d/watcher";
import { AttributeBufferSourceTypes, IWebGLBuffer } from "../data/IWebGLBuffer";
import { VertexAttributeTypes } from "../data/IVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _webGLBufferMap: WeakMap<IWebGLBuffer, WebGLBuffer>
    }
}

export function getWebGLBuffer(gl: WebGLRenderingContext, webGLBuffer: IWebGLBuffer)
{
    let buffer = gl._webGLBufferMap.get(webGLBuffer);

    if (!buffer)
    {
        buffer = gl.createBuffer();
        gl._webGLBufferMap.set(webGLBuffer, buffer);

        const updateBuffer = () =>
        {
            // 获取
            buffer.type = webGLBuffer.type || getWebGLBufferType(webGLBuffer.data);
            const data = getArrayBufferViewWithType(webGLBuffer.data, buffer.type);

            // 上传数据到WebGL
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl[webGLBuffer.usage || "STATIC_DRAW"]);

            //
            buffer.count = data.length;
            buffer.bytesPerElement = data.BYTES_PER_ELEMENT;
        };

        updateBuffer();

        //
        watcher.watch(webGLBuffer, "data", updateBuffer);
    }

    return buffer;
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