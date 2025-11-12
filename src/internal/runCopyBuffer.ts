import { CopyBufferToBuffer } from "@feng3d/render-api";
import { getGLBuffer } from "../caches/getGLBuffer";

export function runCopyBuffer(gl: WebGLRenderingContext, copyBuffer: CopyBufferToBuffer)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const { source: read, destination: write, sourceOffset: readOffset, destinationOffset: writeOffset, size } = copyBuffer;

        const rb = getGLBuffer(gl, read);
        const wb = getGLBuffer(gl, write);

        gl.bindBuffer(gl.COPY_READ_BUFFER, rb);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, wb);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, readOffset, writeOffset, size);

        //
        gl.bindBuffer(gl.COPY_READ_BUFFER, null);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
    }
    else
    {
        console.error(`WebGL1 不支持拷贝缓冲区功能！`);
    }
}

