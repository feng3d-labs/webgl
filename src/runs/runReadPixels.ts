import { getFramebuffer } from "../caches/getFramebuffer";
import { IReadPixels } from "../data/IReadPixels";

export function runReadPixels(gl: WebGLRenderingContext, readPixels: IReadPixels)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const { frameBuffer, attachmentPoint, x, y, width, height, format, type, dstData, dstOffset } = readPixels;

        const webGLFramebuffer = getFramebuffer(gl, readPixels.frameBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);

        gl.readBuffer(gl[attachmentPoint]);
        gl.readPixels(x, y, width, height, gl[format], gl[type], dstData, dstOffset);
    }
    else
    {
        console.error(`WebGL1 不支持 readBuffer/readPixels ！`);
    }
}