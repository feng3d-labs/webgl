import { IGLRenderPassColorAttachment } from "./IGLRenderPassColorAttachment";
import { IGLRenderPassDepthStencilAttachment } from "./IGLRenderPassDepthStencilAttachment";

/**
 * WebGL渲染通道描述
 */
export interface IGLRenderPassDescriptor
{
    /**
     * 颜色附件
     */
    colorAttachments?: IGLRenderPassColorAttachment[];

    /**
     * 深度模板附件。
     */
    depthStencilAttachment?: IGLRenderPassDepthStencilAttachment;
}