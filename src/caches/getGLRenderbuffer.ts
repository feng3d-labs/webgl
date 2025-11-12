import { Renderbuffer } from '../data/Renderbuffer';

export function getGLRenderbuffer(gl: WebGLRenderingContext, renderbuffer: Renderbuffer, sampleCount?: 4)
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

export function deleteRenderbuffer(gl: WebGLRenderingContext, renderbuffer: Renderbuffer)
{
    const webGLRenderbuffer = gl._renderbuffers.get(renderbuffer);
    gl._renderbuffers.delete(renderbuffer);
    //
    gl.deleteRenderbuffer(webGLRenderbuffer);
}