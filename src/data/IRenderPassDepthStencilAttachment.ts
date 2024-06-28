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
}