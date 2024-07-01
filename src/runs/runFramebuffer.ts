import { getFramebuffer } from "../caches/getFramebuffer";
import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";

/**
 * 运行帧缓冲区
 */
export function runFramebuffer(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
{
    const framebuffer = getFramebuffer(gl, passDescriptor);
    if (framebuffer)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    }
}