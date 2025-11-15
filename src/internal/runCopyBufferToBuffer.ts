import { CopyBufferToBuffer } from '@feng3d/render-api';
import { getGLBuffer } from '../caches/getGLBuffer';
import { getIGLBuffer } from '../runs/getIGLBuffer';

export function runCopyBufferToBuffer(gl: WebGLRenderingContext, copyBufferToBuffer: CopyBufferToBuffer)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const rb = getGLBuffer(gl, getIGLBuffer(copyBufferToBuffer.source), 'COPY_READ_BUFFER');
        const wb = getGLBuffer(gl, getIGLBuffer(copyBufferToBuffer.destination), 'COPY_WRITE_BUFFER');

        const sourceOffset = copyBufferToBuffer.source.byteOffset;
        const destinationOffset = copyBufferToBuffer.destination.byteOffset;

        //
        const size = copyBufferToBuffer.size ?? Math.min(copyBufferToBuffer.source.byteLength, copyBufferToBuffer.destination.byteLength);

        gl.bindBuffer(gl.COPY_READ_BUFFER, rb);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, wb);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, sourceOffset, destinationOffset, size);

        //
        gl.bindBuffer(gl.COPY_READ_BUFFER, null);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
    }
    else
    {
        console.error(`WebGL1 不支持拷贝缓冲区功能！`);
    }
}

