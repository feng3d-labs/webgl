import { Buffer, UnReadonly } from "@feng3d/render-api";
import { watcher } from "@feng3d/watcher";

declare global
{
    interface WebGLBuffer
    {
        /**
         * 销毁。
         */
        destroy: () => void;
    }
}

export function getGLBuffer(gl: WebGLRenderingContext, buffer: Buffer)
{
    let webGLBuffer = gl._bufferMap.get(buffer);
    if (webGLBuffer) return webGLBuffer;

    webGLBuffer = gl.createBuffer();
    gl._bufferMap.set(buffer, webGLBuffer);

    const target = buffer.target;

    const size = buffer.size;
    const usage = buffer.usage || "STATIC_DRAW";

    // 上传数据到WebGL
    gl.bindBuffer(gl[target], webGLBuffer);
    gl.bufferData(gl[target], size, gl[usage]);

    const writeBuffer = () =>
    {
        const writeBuffers = buffer.writeBuffers;

        if (!writeBuffers) return;

        gl.bindBuffer(gl[target], webGLBuffer);
        writeBuffers.forEach((writeBuffer) =>
        {
            const bufferOffset = writeBuffer.bufferOffset ?? 0;
            const data = writeBuffer.data;
            const dataOffset = writeBuffer.dataOffset ?? 0;
            //
            let arrayBufferView: Uint8Array;
            if ("buffer" in data)
            {
                arrayBufferView = new Uint8Array(
                    data.buffer,
                    data.byteOffset + dataOffset * data.BYTES_PER_ELEMENT,
                    (data.length - dataOffset) * data.BYTES_PER_ELEMENT
                );
            }
            else
            {
                arrayBufferView = new Uint8Array(
                    data,
                    dataOffset,
                    data.byteLength - dataOffset
                );
            }
            gl.bufferSubData(gl[target], bufferOffset, arrayBufferView);
        });
        (buffer as UnReadonly<Buffer>).writeBuffers = null;
    };

    const dataChange = () =>
    {
        if (!buffer.data) return;

        const writeBuffers = buffer.writeBuffers || [];
        writeBuffers.unshift({ data: buffer.data });
        (buffer as UnReadonly<Buffer>).writeBuffers = writeBuffers;
    };

    dataChange();
    writeBuffer();

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

export function deleteBuffer(gl: WebGLRenderingContext, buffer: Buffer)
{
    const webGLBuffer = gl._bufferMap.get(buffer);
    if (webGLBuffer)
    {
        gl._bufferMap.delete(buffer);
        webGLBuffer.destroy();
        delete webGLBuffer.destroy;
        //
        gl.deleteBuffer(webGLBuffer);
    }
}
