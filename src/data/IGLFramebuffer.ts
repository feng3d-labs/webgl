import { IGLRenderPassDescriptor } from "./IGLPassDescriptor";

/**
 * 等价于 IPassDescriptor 。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
 *
 * @deprecated 请使用 IPassDescriptor 。
 */
export interface IGLFramebuffer extends IGLRenderPassDescriptor { }
