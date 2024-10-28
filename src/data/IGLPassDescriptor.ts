import { IGLRenderPassColorAttachment as IGLRenderPassColorAttachment } from "./IGLRenderPassColorAttachment";
import { IGLRenderPassDepthStencilAttachment as IGLRenderPassDepthStencilAttachment } from "./IGLRenderPassDepthStencilAttachment";

/**
 * WebGL渲染通道描述
 */
export interface IGLPassDescriptor
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