import { RenderPassDescriptor } from "@feng3d/render-api";

/**
 * 获取渲染通道附件尺寸。
 *
 * @param gl
 * @param descriptor
 */
export function getGLRenderPassAttachmentSize(gl: WebGLRenderingContext, descriptor: RenderPassDescriptor): { readonly width: number; readonly height: number; }
{
    if (!descriptor) return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };

    const colorAttachments = descriptor.colorAttachments;
    if (colorAttachments)
    {
        for (let i = 0; i < colorAttachments.length; i++)
        {
            const view = colorAttachments[i].view;
            if (view)
            {
                return { width: view.texture.size[0], height: view.texture.size[1] };
            }

            return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
        }
    }

    const depthStencilAttachment = descriptor.depthStencilAttachment;
    if (depthStencilAttachment)
    {
        const view = depthStencilAttachment.view;
        if (view)
        {
            return { width: view.texture.size[0], height: view.texture.size[1] };
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
}