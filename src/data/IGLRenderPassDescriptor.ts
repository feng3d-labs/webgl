import { IRenderPassDescriptor } from "@feng3d/render-api";
import { IGLRenderPassColorAttachment } from "./IGLRenderPassColorAttachment";
import { IGLRenderPassDepthStencilAttachment } from "./IGLRenderPassDepthStencilAttachment";

/**
 * WebGL渲染通道描述
 */
export interface IGLRenderPassDescriptor extends IRenderPassDescriptor
{
    /**
     * 颜色附件
     */
    readonly colorAttachments?: readonly IGLRenderPassColorAttachment[];

    /**
     * 深度模板附件。
     */
    readonly depthStencilAttachment?: IGLRenderPassDepthStencilAttachment;
}