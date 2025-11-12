import { RenderPass, RenderPassDescriptor, TextureView } from "@feng3d/render-api";
import { getGLRenderOcclusionQuery } from "../caches/getGLRenderOcclusionQuery";
import { getGLRenderPassDescriptorWithMultisample } from "../caches/getGLRenderPassDescriptorWithMultisample";
import { runRenderObject } from "./renderObject/runRenderObject";
import { runBlitFramebuffer } from "./runBlitFramebuffer";
import { runOcclusionQuery } from "./runOcclusionQuery";
import { runRenderPassDescriptor } from "./runRenderPassDescriptor";

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

        runRenderPassDescriptor(gl, passDescriptor);

        renderPass.renderPassObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type__ === "OcclusionQuery")
            {
                runOcclusionQuery(gl, attachmentSize, renderObject);
            }
            else
            {
                runRenderObject(gl, attachmentSize, renderObject);
            }
        });

        runBlitFramebuffer(gl, blitFramebuffer);
    }
    else
    {
        runRenderPassDescriptor(gl, renderPass.descriptor);

        renderPass.renderPassObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type__ === "OcclusionQuery")
            {
                runOcclusionQuery(gl, attachmentSize, renderObject);
            }
            else
            {
                runRenderObject(gl, attachmentSize, renderObject);
            }
        });
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
            return { width: view.texture.descriptor.size[0], height: view.texture.descriptor.size[1] };
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    const depthStencilAttachment = descriptor.depthStencilAttachment;
    if (depthStencilAttachment)
    {
        const view = depthStencilAttachment.view;
        if (view)
        {
            return { width: view.texture.descriptor.size[0], height: view.texture.descriptor.size[1] };
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
}