import { UnReadonly } from '@feng3d/reactivity';
import { Buffer } from '@feng3d/render-api';
import { watcher } from '@feng3d/watcher';

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

export function getGLBuffer(gl: WebGLRenderingContext, buffer: Buffer, target: BufferTarget, usage: BufferUsage = 'STATIC_DRAW')
{
    let webGLBuffer = gl._bufferMap.get(buffer);
    if (webGLBuffer) return webGLBuffer;

    webGLBuffer = gl.createBuffer();
    gl._bufferMap.set(buffer, webGLBuffer);

    const size = buffer.size;

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
            if ('buffer' in data)
            {
                arrayBufferView = new Uint8Array(
                    data.buffer,
                    data.byteOffset + dataOffset * data.BYTES_PER_ELEMENT,
                    (data.length - dataOffset) * data.BYTES_PER_ELEMENT,
                );
            }
            else
            {
                arrayBufferView = new Uint8Array(
                    data,
                    dataOffset,
                    data.byteLength - dataOffset,
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
    watcher.watch(buffer, 'data', dataChange);
    watcher.watch(buffer, 'writeBuffers', writeBuffer);

    //
    webGLBuffer.destroy = () =>
    {
        watcher.unwatch(buffer, 'data', dataChange);
        watcher.unwatch(buffer, 'writeBuffers', writeBuffer);
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

/**
 * WebGL缓冲区使用模式。
 *
 * A GLenum specifying the intended usage pattern of the data store for optimization purposes. Possible values:
 *
 * * gl.STATIC_DRAW: The contents are intended to be specified once by the application, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.DYNAMIC_DRAW: The contents are intended to be respecified repeatedly by the application, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.STREAM_DRAW: The contents are intended to be specified once by the application, and used at most a few times as the source for WebGL drawing and image specification commands.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.STATIC_READ     The contents are intended to be specified once by reading data from WebGL, and queried many times by the application.
 * * gl.DYNAMIC_READ    The contents are intended to be respecified repeatedly by reading data from WebGL, and queried many times by the application.
 * * gl.STREAM_READ     The contents are intended to be specified once by reading data from WebGL, and queried at most a few times by the application
 * * gl.STATIC_COPY     The contents are intended to be specified once by reading data from WebGL, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.DYNAMIC_COPY    The contents are intended to be respecified repeatedly by reading data from WebGL, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.STREAM_COPY     The contents are intended to be specified once by reading data from WebGL, and used at most a few times as the source for WebGL drawing and image specification commands.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
type BufferUsage = 'STATIC_DRAW' | 'DYNAMIC_DRAW' | 'STREAM_DRAW' // WebGL1
    | 'STATIC_READ' | 'DYNAMIC_READ' | 'STREAM_READ' | 'STATIC_COPY' | 'DYNAMIC_COPY' | 'STREAM_COPY' // WebGL2
    ;

/**
 * WebGL缓冲区目标。
 *
 * A GLenum specifying the binding point (target). Possible values:
 *
 * * gl.ARRAY_BUFFER: Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color data.
 * * gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 * * gl.COPY_READ_BUFFER: Buffer for copying from one buffer object to another.
 * * gl.COPY_WRITE_BUFFER: Buffer for copying from one buffer object to another.
 * * gl.TRANSFORM_FEEDBACK_BUFFER: Buffer for transform feedback operations.
 * * gl.UNIFORM_BUFFER: Buffer used for storing uniform blocks.
 * * gl.PIXEL_PACK_BUFFER: Buffer used for pixel transfer operations.
 * * gl.PIXEL_UNPACK_BUFFER: Buffer used for pixel transfer operations.
 *
 */
type BufferTarget = 'ARRAY_BUFFER' | 'ELEMENT_ARRAY_BUFFER' // WebGL1
    | 'COPY_READ_BUFFER' | 'COPY_WRITE_BUFFER' | 'TRANSFORM_FEEDBACK_BUFFER'// WebGL2
    | 'UNIFORM_BUFFER' | 'PIXEL_PACK_BUFFER' | 'PIXEL_UNPACK_BUFFER'; // WebGL2
