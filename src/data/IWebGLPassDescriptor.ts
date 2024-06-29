import { IRenderPassColorAttachment } from "./IRenderPassColorAttachment";
import { IRenderPassDepthStencilAttachment } from "./IRenderPassDepthStencilAttachment";

/**
 * WebGL渲染通道描述
 */
export interface IWebGLPassDescriptor
{
    /**
     * 颜色附件
     */
    colorAttachments?: IRenderPassColorAttachment[];

    /**
     * 深度模板附件。
     */
    depthStencilAttachment?: IRenderPassDepthStencilAttachment;
}