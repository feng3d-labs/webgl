import { IRenderbuffer } from "../data/IRenderbuffer";
import { IPassDescriptor } from "../data/IPassDescriptor";
import { getRenderbuffer } from "./getRenderbuffer";
import { getTexture } from "./getTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _framebuffers_: WeakMap<IPassDescriptor, WebGLFramebuffer>;
    }
}

/**
 * 获取帧缓冲区
 */
export function getFramebuffer(gl: WebGLRenderingContext, passDescriptor: IPassDescriptor)
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
        const texture = getTexture(gl, view);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
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

    const webGLFramebuffer = gl._framebuffers_.get(passDescriptor);
    gl._framebuffers_.delete(passDescriptor);
    //
    gl.deleteFramebuffer(webGLFramebuffer);
}