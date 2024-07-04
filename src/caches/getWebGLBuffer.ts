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

    const target = buffer.target;

    const updateBuffer = () =>
    {
        // 获取
        webGLBuffer.type = type || getWebGLBufferType(buffer.data);
        const data = buffer.data;

        // 上传数据到WebGL
        gl.bindBuffer(gl[target], webGLBuffer);
        gl.bufferData(gl[target], data, gl[buffer.usage || "STATIC_DRAW"]);

        //
        webGLBuffer.count = data.length;
        webGLBuffer.bytesPerElement = data.BYTES_PER_ELEMENT;
    };

    const writeBuffer = () =>
    {
        const writeBuffers = buffer.writeBuffers;

        if (writeBuffers)
        {
            gl.bindBuffer(gl[target], webGLBuffer);
            writeBuffers.forEach((writeBuffer) =>
            {
                const bufferOffset = writeBuffer.bufferOffset || 0;
                const data = writeBuffer.data;

                gl.bufferSubData(gl[target], bufferOffset, data);
            });
            buffer.writeBuffers = null;
        }
    };

    const dataChange = () =>
    {
        const writeBuffers = buffer.writeBuffers || [];
        writeBuffers.push({ data: buffer.data });
        buffer.writeBuffers = writeBuffers;
    };

    updateBuffer();

    //
    watcher.watch(buffer, "data", dataChange);
    watcher.watch(buffer, "writeBuffers", writeBuffer);

    //
    webGLBuffer.destroy = () =>
    {
        watcher.unwatch(buffer, "data", dataChange);
        watcher.unwatch(buffer, "writeBuffers", writeBuffer);
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

export function getWebGLBufferType(data: AttributeBufferSourceTypes)
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
