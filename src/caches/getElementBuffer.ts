import { watcher } from "@feng3d/watcher";
import { DrawElementType, ElementBufferSourceTypes, IIndexBuffer } from "../data/IIndexBuffer";
import { defaultIndexBuffer } from "../runs/runIndexBuffer";

/**
 * 获取索引WebGL缓冲区。
 *
 * @param gl
 * @param buffer
 * @returns
 */
export function getElementBuffer(gl: WebGLRenderingContext, buffer: IIndexBuffer)
{
    let webGLBuffer = gl._buffers.get(buffer);

    if (!webGLBuffer)
    {
        webGLBuffer = gl.createBuffer();
        gl._buffers.set(buffer, webGLBuffer);

        const updateBuffer = () =>
        {
            // 获取
            webGLBuffer.type = buffer.type || getDrawElementType(buffer.data);
            const data = getArrayBufferViewWithType(buffer.data, webGLBuffer.type);

            // 上传数据到WebGL
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl[buffer.usage || defaultIndexBuffer.usage]);

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
    }

    return webGLBuffer;
}

function getDrawElementType(array: ElementBufferSourceTypes)
{
    let type: DrawElementType;
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
    else if (array.length < 1 << 8)
    {
        type = "UNSIGNED_BYTE";
    }
    else if (array.length < 1 << 16)
    {
        type = "UNSIGNED_SHORT";
    }
    else
    {
        type = "UNSIGNED_INT";
    }

    return type;
}

function getArrayBufferViewWithType(array: ElementBufferSourceTypes, type: DrawElementType)
{
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

    return array;
}
