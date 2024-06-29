/**
 * 深度模板附件。
 */
export interface IRenderPassDepthStencilAttachment
{
    /**
     * 清除后填充深度值。
     *
     * 默认为 1。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clearDepth
     */
    depthClearValue?: number;

    /**
     * 是否清除深度值。
     *
     * 默认为 "load"。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clear
     */
    depthLoadOp?: "load" | "clear";

    /**
     * 清除后填充模板值。
     *
     * 默认为 0。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clearStencil
     */
    stencilClearValue?: number;

    /**
     * 是否清除模板值。
     *
     * 默认为 "load"。
     *
     * @see https://developer.mozilla.org/docs/Web/API/WebGLRenderingContext/clear
     */
    stencilLoadOp?: "load" | "clear";
}