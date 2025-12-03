import { CanvasTexture, RenderObject, RenderPass, RenderPassDescriptor, Texture, TextureView } from '@feng3d/render-api';
import { getGLRenderOcclusionQuery } from '../caches/getGLRenderOcclusionQuery';
import { getGLRenderPassDescriptorWithMultisample } from '../caches/getGLRenderPassDescriptorWithMultisample';
import { runRenderObject } from './renderObject/runRenderObject';
import { runBlitFramebuffer } from './runBlitFramebuffer';
import { runOcclusionQuery } from './runOcclusionQuery';
import { runRenderPassDescriptor } from './runRenderPassDescriptor';

export function runRenderPass(gl: WebGLRenderingContext, renderPass: RenderPass, defaultRenderPassDescriptor?: RenderPassDescriptor)
{
    const descriptor = renderPass.descriptor || defaultRenderPassDescriptor;
    // 获取附件尺寸
    const attachmentSize = getGLRenderPassAttachmentSize(gl, descriptor);

    // 检查是否有深度附件
    const hasDepthAttachment = !!(descriptor?.depthStencilAttachment);

    // 处理不被遮挡查询
    const occlusionQuery = getGLRenderOcclusionQuery(gl, renderPass.renderPassObjects);
    //
    occlusionQuery.init();

    if (descriptor?.sampleCount && (descriptor.colorAttachments[0].view as TextureView).texture)
    {
        const { passDescriptor, blitFramebuffer } = getGLRenderPassDescriptorWithMultisample(descriptor);

        runRenderPassDescriptor(gl, passDescriptor);

        renderPass.renderPassObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type__ === 'OcclusionQuery')
            {
                runOcclusionQuery(gl, attachmentSize, renderObject, hasDepthAttachment);
            }
            else
            {
                runRenderObject(gl, attachmentSize, renderObject as RenderObject, hasDepthAttachment);
            }
        });

        runBlitFramebuffer(gl, blitFramebuffer);
    }
    else
    {
        runRenderPassDescriptor(gl, descriptor);

        renderPass.renderPassObjects?.forEach((renderObject) =>
        {
            if (renderObject.__type__ === 'OcclusionQuery')
            {
                runOcclusionQuery(gl, attachmentSize, renderObject, hasDepthAttachment);
            }
            else
            {
                runRenderObject(gl, attachmentSize, renderObject as RenderObject, hasDepthAttachment);
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
            const texture = view.texture;
            // 检查是否是 CanvasTexture
            if ('context' in texture)
            {
                // CanvasTexture: 从画布上下文获取尺寸
                const canvasTexture = texture as CanvasTexture;
                const canvas = typeof canvasTexture.context.canvasId === 'string'
                    ? document.getElementById(canvasTexture.context.canvasId) as HTMLCanvasElement
                    : canvasTexture.context.canvasId;
                if (canvas)
                {
                    return { width: canvas.width, height: canvas.height };
                }
            }
            else if ('descriptor' in texture)
            {
                // Texture: 从描述符获取尺寸
                const regularTexture = texture as Texture;

                return { width: regularTexture.descriptor.size[0], height: regularTexture.descriptor.size[1] };
            }
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    const depthStencilAttachment = descriptor.depthStencilAttachment;
    if (depthStencilAttachment)
    {
        const view = depthStencilAttachment.view;
        if (view)
        {
            const texture = view.texture;
            // 检查是否是 CanvasTexture
            if ('context' in texture)
            {
                // CanvasTexture: 从画布上下文获取尺寸
                const canvasTexture = texture as CanvasTexture;
                const canvas = typeof canvasTexture.context.canvasId === 'string'
                    ? document.getElementById(canvasTexture.context.canvasId) as HTMLCanvasElement
                    : canvasTexture.context.canvasId;
                if (canvas)
                {
                    return { width: canvas.width, height: canvas.height };
                }
            }
            else if ('descriptor' in texture)
            {
                // Texture: 从描述符获取尺寸
                const regularTexture = texture as Texture;

                return { width: regularTexture.descriptor.size[0], height: regularTexture.descriptor.size[1] };
            }
        }

        return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
    }

    return { width: gl.drawingBufferWidth, height: gl.drawingBufferHeight };
}