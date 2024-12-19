import { watcher } from "@feng3d/watcher";
import { IGLBuffer } from "../data/IGLBuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _buffers: Map<IGLBuffer, WebGLBuffer>
    }

    interface WebGLBuffer
    {
        /**
         * 销毁。
         */
        destroy: () => void;
    }
}

export function getGLBuffer(gl: WebGLRenderingContext, buffer: IGLBuffer)
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
                const dataOffset = writeBuffer.dataOffset ?? 0;
                //
                let arrayBufferView: Uint8Array;
                if ("buffer" in data)
                {
                    arrayBufferView = new Uint8Array(data.buffer, data.byteOffset + dataOffset * data.BYTES_PER_ELEMENT, (data.length - dataOffset) * data.BYTES_PER_ELEMENT);
                }
                else
                {
                    arrayBufferView = new Uint8Array(data, dataOffset, data.byteLength - dataOffset);
                }
                gl.bufferSubData(gl[target], bufferOffset, arrayBufferView);
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

export function deleteBuffer(gl: WebGLRenderingContext, buffer: IGLBuffer)
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
