import { IRenderPassDepthStencilAttachment } from "@feng3d/render-api";
import { IGLTextureView } from "./IGLTextureView";

/**
 * 深度模板附件。
 */
export interface IGLRenderPassDepthStencilAttachment extends IRenderPassDepthStencilAttachment
{
    /**
     * 深度附件视图。
     *
     * 如果没有设置，默认为画布；否则使用 帧缓冲 。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferRenderbuffer
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/framebufferTexture2D
     */
    readonly view?: IGLTextureView;

    /**
     * 清除后填充深度值。
     *
     * 默认为 1。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clearDepth
     */
    readonly depthClearValue?: number;

    /**
     * 是否清除深度值。
     *
     * 默认为 "load"。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clear
     */
    readonly depthLoadOp?: "load" | "clear";

    /**
     * 清除后填充模板值。
     *
     * 默认为 0。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearStencil
     */
    readonly stencilClearValue?: number;

    /**
     * 是否清除模板值。
     *
     * 默认为 "load"。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clear
     */
    readonly stencilLoadOp?: "load" | "clear";
}