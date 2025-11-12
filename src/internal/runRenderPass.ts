import { RenderPass, RenderPassDescriptor } from "@feng3d/render-api";
import { getGLRenderOcclusionQuery } from "../caches/getGLRenderOcclusionQuery";
import { getGLRenderPassDescriptorWithMultisample } from "../caches/getGLRenderPassDescriptorWithMultisample";
import { RunWebGL } from "../RunWebGL";

export function runRenderPass(gl: WebGLRenderingContext, renderPass: RenderPass)
{
    // 获取附件尺寸
    const attachmentSize = getGLRenderPassAttachmentSize(gl, renderPass.descriptor);

    // 处理不被遮挡查询
    const occlusionQuery = getGLRenderOcclusionQuery(gl, renderPass.renderPassObjects);
    //
    occlusionQuery.init();

    if (renderPass.descriptor?.sampleCount && (renderPass.descriptor.colorAttachments[0].view as TextureView).texture)
    {
        const { passDescriptor, blitFramebuffer } = getGLRenderPassDescriptorWithMultisample(renderPass.descriptor);

        RunWebGL.runRenderPassDescriptor(gl, passDescriptor);

        RunWebGL.runRenderObjects(gl, attachmentSize, renderPass.renderPassObjects);

        RunWebGL.runBlitFramebuffer(gl, blitFramebuffer);
    }
    else
    {
        RunWebGL.runRenderPassDescriptor(gl, renderPass.descriptor);

        RunWebGL.runRenderObjects(gl, attachmentSize, renderPass.renderPassObjects);
    }

    occlusionQuery.resolve(renderPass);
}

/**
 * 获取渲染通道附件尺寸。
 *
 * @param gl
 * @param descriptor
 */
function getGLRenderPassAttachmentSize(gl: WebGLRenderingContext, descriptor: RenderPassDescriptor): { readonly width: number; readonly height: number; }
{
    if (!descriptor) return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };

    const colorAttachments = descriptor.colorAttachments;
    if (colorAttachments)
    {
        const view = colorAttachments[0]?.view;
        if (view)
        {
            return { width: view.texture.size[0], height: view.texture.size[1] };
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
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