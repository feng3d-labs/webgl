import { IRenderPassColorAttachment } from "@feng3d/render-api";
import { IGLRenderbuffer } from "./IGLRenderbuffer";
import { IGLTextureView } from "./IGLTexture";

export interface IGLRenderPassColorAttachment extends IRenderPassColorAttachment
{
    /**
     * 颜色附件视图。
     *
     * 如果没有设置，默认为画布；否则使用 帧缓冲 。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D
     */
    readonly view?: IGLAttachmentView;
}

export type IGLAttachmentView = IGLTextureView;
