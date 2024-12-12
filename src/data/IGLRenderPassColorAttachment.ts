import { IRenderPassColorAttachment } from "@feng3d/render-api";
import { IGLTextureView } from "./IGLTextureView";

/**
 * 渲染通道颜色附件。
 */
export interface IGLRenderPassColorAttachment extends IRenderPassColorAttachment
{
    /**
     * 颜色附件视图。
     *
     * 如果没有设置，默认为画布；否则使用 帧缓冲 。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D
     * 
     * 注：引擎运行中该属性可能是 IGLRenderbuffer 类型，用于处理多重采样。
     */
    readonly view?: IGLTextureView;
}
