import { IRenderbuffer } from "./IRenderbuffer";
import { ITexture } from "./ITexture";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
 */
export interface IFramebuffer
{
    /**
     * 颜色附件。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D
     */
    colorAttachments: (IRenderbuffer | ITexture)[];
}
