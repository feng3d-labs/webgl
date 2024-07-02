import { getFramebuffer } from "../caches/getFramebuffer";
import { IPassDescriptor } from "../data/IPassDescriptor";

/**
 * 运行帧缓冲区
 */
export function runFramebuffer(gl: WebGLRenderingContext, passDescriptor: IPassDescriptor)
{
    const framebuffer = getFramebuffer(gl, passDescriptor);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
}