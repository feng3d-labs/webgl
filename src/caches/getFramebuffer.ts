import { IPassDescriptor } from "../data/IPassDescriptor";
import { IRenderbuffer } from "../data/IRenderbuffer";
import { getRenderbuffer } from "./getRenderbuffer";
import { getTexture } from "./getTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _framebuffers: WeakMap<IPassDescriptor, WebGLFramebuffer>;
    }
}

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

    if ("texture" in view)
    {
        const { texture, level } = view;

        const webGLTexture = getTexture(gl, texture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, webGLTexture, level);
    }
    else
    {
        const renderbuffer = getRenderbuffer(gl, view as IRenderbuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

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