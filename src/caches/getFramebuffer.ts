import { IGLRenderPassDescriptor } from "../data/IGLRenderPassDescriptor";
import { IGLRenderbuffer } from "../data/IGLRenderbuffer";
import { IGLTextureView } from "../data/IGLTextureView";
import { _IGLRenderPassDescriptorWithMultisample, IGLRenderPassDescriptorWithMultisample } from "./getIGLRenderPassDescriptorWithMultisample";
import { deleteRenderbuffer, getGLRenderbuffer } from "./getGLRenderbuffer";
import { getGLTexture } from "./getGLTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _framebuffers: Map<IGLRenderPassDescriptor, WebGLFramebuffer>;
    }
}

const defaultTextureView: Partial<IGLTextureView> = { baseMipLevel: 0, baseArrayLayer: 0 };

/**
 * 获取帧缓冲区
 */
export function getFramebuffer(gl: WebGLRenderingContext, passDescriptor: IGLRenderPassDescriptor)
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
        const { view } = item;
        const attachment = gl[`COLOR_ATTACHMENT${i}`];
        drawBuffers.push(attachment);
        if ("texture" in view)
        {
            const { texture, baseMipLevel: level, baseArrayLayer: layer } = { ...defaultTextureView, ...view };

            const webGLTexture = getGLTexture(gl, texture);
            const textureTarget = webGLTexture.textureTarget;

            if (textureTarget === "TEXTURE_2D")
            {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl[textureTarget], webGLTexture, level);
            }
            else if (textureTarget === "TEXTURE_2D_ARRAY")
            {
                if (gl instanceof WebGL2RenderingContext)
                {
                    gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, attachment, webGLTexture, level, layer);
                }
            }
            else
            {
                console.error(`未处理 ${textureTarget} 的颜色附件纹理设置！`);
            }
        }
        else
        {
            const renderbuffer = getGLRenderbuffer(gl, view as IGLRenderbuffer, sampleCount);
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
    if (passDescriptor.depthStencilAttachment)
    {
        const { view } = passDescriptor.depthStencilAttachment;
        const { texture, baseMipLevel: level, baseArrayLayer: layer } = { ...defaultTextureView, ...view };

        const webGLTexture = getGLTexture(gl, texture);
        const textureTarget = webGLTexture.textureTarget;

        if (textureTarget === "TEXTURE_2D")
        {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl[textureTarget], webGLTexture, level);
        }
        else if (textureTarget === "TEXTURE_2D_ARRAY")
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.framebufferTextureLayer(gl.DRAW_FRAMEBUFFER, gl.DEPTH_ATTACHMENT, webGLTexture, level, layer);
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
export function deleteFramebuffer(gl: WebGLRenderingContext, passDescriptor: IGLRenderPassDescriptor, handleMultisample = true)
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