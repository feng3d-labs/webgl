import { getFramebuffer } from "../caches/getFramebuffer";
import { IGLRenderPassDescriptor } from "../data/IGLPassDescriptor";

/**
 * 运行帧缓冲区
 */
export function runFramebuffer(gl: WebGLRenderingContext, passDescriptor: IGLRenderPassDescriptor)
{
    const framebuffer = getFramebuffer(gl, passDescriptor);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
}