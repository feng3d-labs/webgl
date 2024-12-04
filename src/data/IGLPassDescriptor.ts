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

    /**
     * 采用次数。
     *
     * 注意： WebGL2 支持。
     * 
     * 当值存在时，引擎将会自动创建支持`multisample`的`IGLRenderbuffer`用于接收颜色附件的结果。在渲染通道执行结束后在由`IGLRenderbuffer`拷贝到对应纹理上。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/renderbufferStorageMultisample
     */
    multisample?: 4;
}