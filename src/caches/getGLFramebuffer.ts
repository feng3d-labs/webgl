import { CanvasTexture, RenderPassDescriptor, Texture, TextureView } from '@feng3d/render-api';
import { Renderbuffer } from '../data/Renderbuffer';
import { deleteRenderbuffer, getGLRenderbuffer } from './getGLRenderbuffer';
import { _IGLRenderPassDescriptorWithMultisample, GLRenderPassDescriptorWithMultisample } from './getGLRenderPassDescriptorWithMultisample';
import { getGLTexture } from './getGLTexture';
import { getGLTextureTarget } from './getGLTextureTarget';

/**
 * 获取帧缓冲区
 */
export function getGLFramebuffer(gl: WebGLRenderingContext, passDescriptor: RenderPassDescriptor)
{
    const view = passDescriptor?.colorAttachments?.[0]?.view || passDescriptor?.depthStencilAttachment?.view;

    if (!view) return null;

    // 检查是否是 CanvasTexture，如果是，返回 null（使用默认 framebuffer）
    if ('texture' in view)
    {
        const texture = view.texture;

        if ('context' in texture)
        {
            // CanvasTexture: 使用默认 framebuffer（画布）
            return null;
        }
    }

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
        const view = item.view as (TextureView | Renderbuffer);
        const attachment = gl[`COLOR_ATTACHMENT${i}`];

        drawBuffers.push(attachment);
        if ('texture' in view)
        {
            const texture = view.texture;
            const baseMipLevel = view.baseMipLevel || 0;
            const baseArrayLayer = view.baseArrayLayer || 0;

            // 检查是否是 CanvasTexture
            if ('context' in texture)
            {
                // CanvasTexture: 不需要附加到 framebuffer，因为使用的是默认 framebuffer
                // 跳过处理，不添加到 drawBuffers
                drawBuffers.pop(); // 移除刚才添加的 attachment

                return; // 跳过当前迭代
            }

            const webGLTexture = getGLTexture(gl, texture as Texture);
            const textureTarget = getGLTextureTarget((texture as Texture).descriptor.dimension);

            if (textureTarget === 'TEXTURE_2D')
            {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl[textureTarget], webGLTexture, baseMipLevel);
            }
            else if (textureTarget === 'TEXTURE_2D_ARRAY')
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
    const depthStencilAttachment = passDescriptor.depthStencilAttachment;

    if (depthStencilAttachment)
    {
        // 如果有 view，使用纹理作为深度附件
        if (depthStencilAttachment.view)
        {
            const view = depthStencilAttachment.view;

            const texture = view.texture;
            const baseMipLevel = view.baseMipLevel || 0;
            const baseArrayLayer = view.baseArrayLayer || 0;

            // 检查是否是 CanvasTexture
            if ('context' in texture)
            {
                // CanvasTexture: 不需要附加到 framebuffer，因为使用的是默认 framebuffer
                // 跳过处理
            }
            else
            {
                const webGLTexture = getGLTexture(gl, texture as Texture);
                const textureTarget = getGLTextureTarget((texture as Texture).descriptor.dimension);

                if (textureTarget === 'TEXTURE_2D')
                {
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl[textureTarget], webGLTexture, baseMipLevel);
                }
                else if (textureTarget === 'TEXTURE_2D_ARRAY')
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
        }
        // 如果没有 view，但配置了 depthStencilAttachment，自动创建深度 renderbuffer
        else if (webGLFramebuffer)
        {
            // 获取附件尺寸
            const colorAttachment = passDescriptor.colorAttachments?.[0];
            let width = gl.drawingBufferWidth;
            let height = gl.drawingBufferHeight;

            if (colorAttachment?.view)
            {
                const view = colorAttachment.view;

                if ('texture' in view)
                {
                    const texture = view.texture;

                    if ('descriptor' in texture)
                    {
                        width = texture.descriptor.size[0];
                        height = texture.descriptor.size[1];
                    }
                }
            }

            // 创建深度 renderbuffer
            const depthRenderbuffer = gl.createRenderbuffer();

            gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);
            }
            else
            {
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);
            }

            // 将 renderbuffer 存储到 framebuffer 的缓存中，以便后续清理
            // 使用 Map 存储 framebuffer 到 renderbuffer 的映射
            const glAny = gl as any;

            if (!glAny._framebufferDepthRenderbuffers)
            {
                glAny._framebufferDepthRenderbuffers = new Map();
            }
            glAny._framebufferDepthRenderbuffers.set(webGLFramebuffer, depthRenderbuffer);
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
export function deleteFramebuffer(gl: WebGLRenderingContext, passDescriptor: RenderPassDescriptor, handleMultisample = true)
{
    if (handleMultisample && passDescriptor?.[_IGLRenderPassDescriptorWithMultisample])
    {
        deleteRenderPassDescriptorWithMultisample(gl, passDescriptor[_IGLRenderPassDescriptorWithMultisample]);

        return;
    }

    const webGLFramebuffer = gl._framebuffers.get(passDescriptor);

    gl._framebuffers.delete(passDescriptor);

    // 删除关联的深度 renderbuffer（如果存在）
    const glAny = gl as any;

    if (glAny._framebufferDepthRenderbuffers && webGLFramebuffer)
    {
        const depthRenderbuffer = glAny._framebufferDepthRenderbuffers.get(webGLFramebuffer);

        if (depthRenderbuffer)
        {
            gl.deleteRenderbuffer(depthRenderbuffer);
            glAny._framebufferDepthRenderbuffers.delete(webGLFramebuffer);
        }
    }

    //
    gl.deleteFramebuffer(webGLFramebuffer);
}

function deleteRenderPassDescriptorWithMultisample(gl: WebGLRenderingContext, renderPassDescriptorWithMultisample: GLRenderPassDescriptorWithMultisample)
{
    deleteFramebuffer(gl, renderPassDescriptorWithMultisample.blitFramebuffer.read, false);
    deleteFramebuffer(gl, renderPassDescriptorWithMultisample.blitFramebuffer.draw, false);

    renderPassDescriptorWithMultisample.renderbuffers.forEach((v) =>
    {
        deleteRenderbuffer(gl, v);
    });
}