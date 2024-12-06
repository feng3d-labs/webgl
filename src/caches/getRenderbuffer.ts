import { IGLRenderbuffer } from "../data/IGLRenderbuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _renderbuffers: Map<IGLRenderbuffer, WebGLRenderbuffer>;
    }
}

export function getRenderbuffer(gl: WebGLRenderingContext, renderbuffer: IGLRenderbuffer, sampleCount?: 4)
{
    let webGLRenderbuffer = gl._renderbuffers.get(renderbuffer);
    if (webGLRenderbuffer) return webGLRenderbuffer;

    webGLRenderbuffer = gl.createRenderbuffer();
    gl._renderbuffers.set(renderbuffer, webGLRenderbuffer);

    const { internalformat, width, height } = renderbuffer;

    gl.bindRenderbuffer(gl.RENDERBUFFER, webGLRenderbuffer);
    if (sampleCount === 4 && gl instanceof WebGL2RenderingContext)
    {
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, sampleCount, gl[internalformat], width, height);
    }
    else
    {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl[internalformat], width, height);
    }

    return webGLRenderbuffer;
}

export function deleteRenderbuffer(gl: WebGLRenderingContext, renderbuffer: IGLRenderbuffer)
{
    const webGLRenderbuffer = gl._renderbuffers.get(renderbuffer);
    gl._renderbuffers.delete(renderbuffer);
    //
    gl.deleteRenderbuffer(webGLRenderbuffer);
}