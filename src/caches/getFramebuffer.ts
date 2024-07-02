import { IPassDescriptor } from "../data/IPassDescriptor";
import { IRenderbuffer } from "../data/IRenderbuffer";
import { ITextureView } from "../data/ITexture";
import { getRenderbuffer } from "./getRenderbuffer";
import { getTexture } from "./getTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _framebuffers: WeakMap<IPassDescriptor, WebGLFramebuffer>;
    }
}

const defaultTextureView: Partial<ITextureView> = { level: 0, layer: 0 };

/**
 * 获取帧缓冲区
 */
export function getFramebuffer(gl: WebGLRenderingContext, passDescriptor: IPassDescriptor)
{
    const view = passDescriptor?.colorAttachments?.[0]?.view;
    if (!view) return null;

    let webGLFramebuffer = gl._framebuffers.get(passDescriptor);
    if (webGLFramebuffer) return webGLFramebuffer;

    webGLFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);
    gl._framebuffers.set(passDescriptor, webGLFramebuffer);

    const drawBuffers: number[] = [];
    passDescriptor.colorAttachments.forEach((item, i) =>
    {
        const { view } = item;
        const attachment = gl[`COLOR_ATTACHMENT${i}`];
        drawBuffers.push(attachment);
        if ("texture" in view)
        {
            const { texture, level, layer } = { ...defaultTextureView, ...view };

            const webGLTexture = getTexture(gl, texture);
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
            const renderbuffer = getRenderbuffer(gl, view as IRenderbuffer);
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

    return webGLFramebuffer;
}

export function deleteFramebuffer(gl: WebGLRenderingContext, passDescriptor: IPassDescriptor)
{
    const view = passDescriptor?.colorAttachments?.[0]?.view;
    if (!view) return null;

    const webGLFramebuffer = gl._framebuffers.get(passDescriptor);
    gl._framebuffers.delete(passDescriptor);
    //
    gl.deleteFramebuffer(webGLFramebuffer);
}