import { IRenderbuffer } from "../data/IRenderbuffer";
import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";
import { getWebGLRenderbuffer } from "./getWebGLRenderbuffer";
import { getWebGLTexture } from "./getWebGLTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _framebuffers_: WeakMap<IWebGLPassDescriptor, WebGLFramebuffer>;
    }
}

/**
 * 获取帧缓冲区
 */
export function getFramebuffer(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
{
    const view = passDescriptor?.colorAttachments?.[0]?.view;
    if (!view) return null;

    let webGLFramebuffer = gl._framebuffers_.get(passDescriptor);
    if (webGLFramebuffer) return webGLFramebuffer;

    webGLFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, webGLFramebuffer);
    gl._framebuffers_.set(passDescriptor, webGLFramebuffer);

    if ("sources" in view)
    {
        const texture = getWebGLTexture(gl, view);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }
    else
    {
        const renderbuffer = getWebGLRenderbuffer(gl, view as IRenderbuffer);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return webGLFramebuffer;
}

export function deleteFramebuffer(gl: WebGLRenderingContext, passDescriptor: IWebGLPassDescriptor)
{
    const view = passDescriptor?.colorAttachments?.[0]?.view;
    if (!view) return null;

    const webGLFramebuffer = gl._framebuffers_.get(passDescriptor);
    gl._framebuffers_.delete(passDescriptor);
    //
    gl.deleteFramebuffer(webGLFramebuffer);
}