import { watcher } from "@feng3d/watcher";
import { IAttributeBufferSourceTypes, IBuffer } from "../data/IBuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _buffers: Map<IBuffer, WebGLBuffer>
    }

    interface WebGLBuffer
    {
        data: IAttributeBufferSourceTypes;

        /**
         * 销毁。
         */
        destroy: () => void;
    }

    interface Float32Array
    {
        bufferType: "FLOAT";
    }
    interface Uint32Array
    {
        bufferType: "UNSIGNED_INT";
    }
    interface Int32Array
    {
        bufferType: "INT";
    }
    interface Uint16Array
    {
        bufferType: "UNSIGNED_SHORT";
    }
    interface Int16Array
    {
        bufferType: "SHORT";
    }
    interface Uint8Array
    {
        bufferType: "UNSIGNED_BYTE";
    }
    interface Int8Array
    {
        bufferType: "BYTE";
    }
    interface Uint8ClampedArray
    {
        bufferType: "BYTE";
    }
}

// eslint-disable-next-line no-extend-native
Float32Array.prototype.bufferType = "FLOAT";
// eslint-disable-next-line no-extend-native
Uint32Array.prototype.bufferType = "UNSIGNED_INT";
// eslint-disable-next-line no-extend-native
Int32Array.prototype.bufferType = "INT";
// eslint-disable-next-line no-extend-native
Uint16Array.prototype.bufferType = "UNSIGNED_SHORT";
// eslint-disable-next-line no-extend-native
Int16Array.prototype.bufferType = "SHORT";
// eslint-disable-next-line no-extend-native
Uint8Array.prototype.bufferType = "UNSIGNED_BYTE";
// eslint-disable-next-line no-extend-native
Int8Array.prototype.bufferType = "BYTE";
// eslint-disable-next-line no-extend-native
Uint8ClampedArray.prototype.bufferType = "BYTE";

export function getWebGLBuffer(gl: WebGLRenderingContext, buffer: IBuffer)
{
    let webGLBuffer = gl._buffers.get(buffer);
    if (webGLBuffer) return webGLBuffer;

    webGLBuffer = gl.createBuffer();
    gl._buffers.set(buffer, webGLBuffer);

    const target = buffer.target;

    const updateBuffer = () =>
    {
        // 获取
        const data = buffer.data;
        const size = buffer.size;
        const usage = buffer.usage || "STATIC_DRAW";

        // 上传数据到WebGL
        gl.bindBuffer(gl[target], webGLBuffer);

        if (data)
        {
            gl.bufferData(gl[target], data, gl[usage]);
        }
        else if (size)
        {
            gl.bufferData(gl[target], size, gl[usage]);
        }
        else
        {
            console.log(`初始化缓冲区时必须提供数据或者尺寸！`);
        }

        //
        webGLBuffer.data = data;
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
