import { IRenderPassDescriptor } from "@feng3d/render-api";
import { getFramebuffer } from "../caches/getFramebuffer";

/**
 * 运行帧缓冲区
 */
export function runFramebuffer(gl: WebGLRenderingContext, passDescriptor: IRenderPassDescriptor)
{
    const framebuffer = getFramebuffer(gl, passDescriptor);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
}