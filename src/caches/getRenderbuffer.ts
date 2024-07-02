import { IRenderbuffer } from "../data/IRenderbuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _renderbuffers: Map<IRenderbuffer, WebGLRenderbuffer>;
    }
}

export function getRenderbuffer(gl: WebGLRenderingContext, renderbuffer: IRenderbuffer)
{
    let webGLRenderbuffer = gl._renderbuffers.get(renderbuffer);
    if (webGLRenderbuffer) return webGLRenderbuffer;

    webGLRenderbuffer = gl.createRenderbuffer();
    gl._renderbuffers.set(renderbuffer, webGLRenderbuffer);

    const { samples, internalformat, width, height } = renderbuffer;

    gl.bindRenderbuffer(gl.RENDERBUFFER, webGLRenderbuffer);
    if (samples && gl instanceof WebGL2RenderingContext)
    {
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl[internalformat], width, height);
    }
    else
    {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl[internalformat], width, height);
    }

    return webGLRenderbuffer;
}

export function deleteRenderbuffer(gl: WebGLRenderingContext, renderbuffer: IRenderbuffer)
{
    const webGLRenderbuffer = gl._renderbuffers.get(renderbuffer);
    gl._renderbuffers.delete(renderbuffer);
    //
    gl.deleteRenderbuffer(webGLRenderbuffer);
}