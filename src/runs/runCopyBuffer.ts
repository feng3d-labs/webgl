import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IGLCopyBuffer } from "../data/IGLCopyBuffer";

export function runCopyBuffer(gl: WebGLRenderingContext, copyBuffer: IGLCopyBuffer)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const { read, write, readOffset, writeOffset, size } = copyBuffer;

        const rb = getWebGLBuffer(gl, read);
        const wb = getWebGLBuffer(gl, write);

        gl.bindBuffer(gl.COPY_READ_BUFFER, rb);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, wb);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, readOffset, writeOffset, size);
    }
    else
    {
        console.error(`WebGL1 不支持拷贝缓冲区功能！`);
    }
}