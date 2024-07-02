import { ISampler } from "../data/ISampler";
import { defaultSampler } from "../runs/runSampler";

declare global
{
    interface WebGLRenderingContext
    {
        _samplers: Map<ISampler, WebGLSampler>;
    }
}

export function getSampler(gl: WebGLRenderingContext, sampler?: ISampler)
{
    let webGLSampler = gl._samplers.get(sampler);
    if (webGLSampler) return webGLSampler;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLSampler = gl.createSampler();
        gl._samplers.set(sampler, webGLSampler);

        const { minFilter, magFilter, wrapS, wrapT, wrapR, lodMinClamp, lodMaxClamp, compareMode, compare } = { ...defaultSampler, ...sampler };

        gl.samplerParameteri(webGLSampler, gl.TEXTURE_MIN_FILTER, gl[minFilter]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_MAG_FILTER, gl[magFilter]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_WRAP_S, gl[wrapS]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_WRAP_T, gl[wrapT]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_WRAP_R, gl[wrapR]);
        gl.samplerParameterf(webGLSampler, gl.TEXTURE_MIN_LOD, lodMinClamp);
        gl.samplerParameterf(webGLSampler, gl.TEXTURE_MAX_LOD, lodMaxClamp);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_COMPARE_MODE, gl[compareMode]);
        gl.samplerParameteri(webGLSampler, gl.TEXTURE_COMPARE_FUNC, gl[compare]);
    }

    return webGLSampler;
}