import { IRenderbuffer } from "../data/IRenderbuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _renderbuffers_: WeakMap<IRenderbuffer, WebGLRenderbuffer>;
    }
}

export function getWebGLRenderbuffer(gl: WebGLRenderingContext, renderbuffer: IRenderbuffer)
{
    let webGLRenderbuffer = gl._renderbuffers_.get(renderbuffer);
    if (webGLRenderbuffer) return webGLRenderbuffer;

    webGLRenderbuffer = gl.createRenderbuffer();
    gl._renderbuffers_.set(renderbuffer, webGLRenderbuffer);

    const { internalformat, width, height } = renderbuffer;

    gl.bindRenderbuffer(gl.RENDERBUFFER, webGLRenderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl[internalformat], width, height);

    return webGLRenderbuffer;
}

export function deleteRenderbuffer(gl: WebGLRenderingContext, renderbuffer: IRenderbuffer)
{
    const webGLRenderbuffer = gl._renderbuffers_.get(renderbuffer);
    gl._renderbuffers_.delete(renderbuffer);
    //
    gl.deleteRenderbuffer(webGLRenderbuffer);
}