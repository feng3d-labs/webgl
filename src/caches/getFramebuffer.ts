import { IRenderPassDescriptor, ITextureView } from "@feng3d/render-api";
import { IGLRenderbuffer } from "../data/IGLRenderbuffer";
import { deleteRenderbuffer, getGLRenderbuffer } from "./getGLRenderbuffer";
import { getGLTexture } from "./getGLTexture";
import { _IGLRenderPassDescriptorWithMultisample, IGLRenderPassDescriptorWithMultisample } from "./getIGLRenderPassDescriptorWithMultisample";
import { getIGLTextureTarget } from "./getIGLTextureTarget";

declare global
{
    interface WebGLRenderingContext
    {
        _framebuffers: Map<IRenderPassDescriptor, WebGLFramebuffer>;
    }
}

/**
 * 获取帧缓冲区
 */
export function getFramebuffer(gl: WebGLRenderingContext, passDescriptor: IRenderPassDescriptor)
{
    const view = passDescriptor?.colorAttachments?.[0]?.view || passDescriptor?.depthStencilAttachment?.view;
    if (!view) return null;

    let webGLFramebuffer = gl._framebuffers.get(passDescriptor);
    if (webGLFramebuffer) return webGLFramebuffer;

    const sampleCount = passDescriptor.sampleCount;

    webGLFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);
    gl._framebuffers.set(passDescriptor, webGLFramebuffer);

    // 处理颜色附件
    const drawBuffers: number[] = [];
    passDescriptor.colorAttachments?.forEach((item, i) =>
    {
        const view = item.view as (ITextureView | IGLRenderbuffer);
        const attachment = gl[`COLOR_ATTACHMENT${i}`];
        drawBuffers.push(attachment);
        if ("texture" in view)
        {
            const texture = view.texture;
            const baseMipLevel = view.baseMipLevel || 0;
            const baseArrayLayer = view.baseArrayLayer || 0;

            if ("context" in texture)
            {
                console.error(`WebGL中不支持 ICanvasTexture!`, texture);
                return;
            }

            const webGLTexture = getGLTexture(gl, texture);
            const textureTarget = getIGLTextureTarget(texture.dimension);

            if (textureTarget === "TEXTURE_2D")
            {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl[textureTarget], webGLTexture, baseMipLevel);
            }
            else if (textureTarget === "TEXTURE_2D_ARRAY")
            {
                if (gl instanceof WebGL2RenderingContext)
                {
                    gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, attachment, webGLTexture, baseMipLevel, baseArrayLayer);
                }
            }
            else
            {
                console.error(`未处理 ${textureTarget} 的颜色附件纹理设置！`);
            }
        }
        else
        {
            const renderbuffer = getGLRenderbuffer(gl, view, sampleCount);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, attachment, gl.RENDERBUFFER, renderbuffer);
        }
    });

    if (gl instanceof WebGL2RenderingContext)
    {
        gl.drawBuffers(drawBuffers);
    }
    else
    {
        console.error(`WebGL1 不支持 drawBuffers 。`);
    }

    // 处理深度模板附件
    if (passDescriptor.depthStencilAttachment?.view)
    {
        const view = passDescriptor.depthStencilAttachment.view;

        const texture = view.texture;
        const baseMipLevel = view.baseMipLevel || 0;
        const baseArrayLayer = view.baseArrayLayer || 0;

        if ("context" in texture)
        {
            console.error(`WebGL中不支持 ICanvasTexture!`, texture);
            return;
        }

        const webGLTexture = getGLTexture(gl, texture);
        const textureTarget = getIGLTextureTarget(texture.dimension);

        if (textureTarget === "TEXTURE_2D")
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl[textureTarget], webGLTexture, baseMipLevel);
        }
        else if (textureTarget === "TEXTURE_2D_ARRAY")
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, webGLTexture, baseMipLevel, baseArrayLayer);
            }
        }
        else
        {
            console.error(`未处理 ${textureTarget} 的深度模板附件纹理设置！`);
        }
    }

    return webGLFramebuffer;
}

/**
 * 
 * @param gl 
 * @param passDescriptor 
 * @param handleMultisample 处理存在多重采样的渲染通道描述。
 * @returns 
 */
export function deleteFramebuffer(gl: WebGLRenderingContext, passDescriptor: IRenderPassDescriptor, handleMultisample = true)
{
    if (handleMultisample && passDescriptor?.[_IGLRenderPassDescriptorWithMultisample])
    {
        deleteRenderPassDescriptorWithMultisample(gl, passDescriptor[_IGLRenderPassDescriptorWithMultisample]);
        return;
    }

    const webGLFramebuffer = gl._framebuffers.get(passDescriptor);
    gl._framebuffers.delete(passDescriptor);
    //
    gl.deleteFramebuffer(webGLFramebuffer);
}

function deleteRenderPassDescriptorWithMultisample(gl: WebGLRenderingContext, renderPassDescriptorWithMultisample: IGLRenderPassDescriptorWithMultisample)
{
    deleteFramebuffer(gl, renderPassDescriptorWithMultisample.blitFramebuffer.read, false);
    deleteFramebuffer(gl, renderPassDescriptorWithMultisample.blitFramebuffer.draw, false);

    renderPassDescriptorWithMultisample.renderbuffers.forEach((v) =>
    {
        deleteRenderbuffer(gl, v);
    })
}