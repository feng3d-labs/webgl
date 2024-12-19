import { getGLFramebuffer } from "../caches/getGLFramebuffer";
import { IGLReadPixels } from "../data/IGLReadPixels";

export function readPixels(gl: WebGLRenderingContext, readPixels: IGLReadPixels)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const { frameBuffer, attachmentPoint, x, y, width, height, format, type, dstData, dstOffset } = readPixels;

        const webGLFramebuffer = getGLFramebuffer(gl, frameBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);

        gl.readBuffer(gl[attachmentPoint]);
        gl.readPixels(x, y, width, height, gl[format], gl[type], dstData, dstOffset);
    }
    else
    {
        console.error(`WebGL1 不支持 readBuffer/readPixels ！`);
    }
}
