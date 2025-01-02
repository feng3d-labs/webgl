import { IAddressMode } from "@feng3d/render-api";
import { IGLCompareFunction } from "../data/IGLDepthStencilState";
import { IGLSampler, IGLSamplerCompareMode, IGLTextureMagFilter, IGLTextureMinFilter, IGLTextureWrap } from "../data/IGLSampler";

declare global
{
    interface WebGLRenderingContext
    {
        _samplers: Map<IGLSampler, WebGLSampler>;
    }
}

export function getGLSampler(gl: WebGLRenderingContext, sampler?: IGLSampler)
{
    let webGLSampler = gl._samplers.get(sampler);
    if (webGLSampler) return webGLSampler;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLSampler = gl.createSampler();
        gl._samplers.set(sampler, webGLSampler);

        const minFilter: IGLTextureMinFilter = sampler.minFilter || "LINEAR_MIPMAP_LINEAR";
        const magFilter: IGLTextureMagFilter = sampler.magFilter || "LINEAR";
        const wrapS: IGLTextureWrap = getIGLTextureWrap(sampler.addressModeU);
        const wrapT: IGLTextureWrap = getIGLTextureWrap(sampler.addressModeV);
        const wrapR: IGLTextureWrap = getIGLTextureWrap(sampler.addressModeW);
        const lodMinClamp = sampler.lodMinClamp || 0;
        const lodMaxClamp = sampler.lodMaxClamp || 16;
        const compareMode: IGLSamplerCompareMode = sampler.compareMode || "NONE";
        const compare: IGLCompareFunction = sampler.compare || "LEQUAL";

        //
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

export function deleteSampler(gl: WebGLRenderingContext, sampler?: IGLSampler)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLSampler = gl._samplers.get(sampler);
        gl._samplers.delete(sampler);
        gl.deleteSampler(webGLSampler);
    }
}

export function getIGLTextureWrap(addressMode: IAddressMode = "repeat")
{
    const textureWrap: IGLTextureWrap = addressModeMap[addressMode];

    console.assert(!!textureWrap, `接收到错误值，请从 ${Object.keys(addressModeMap).toString()} 中取值！`);

    return textureWrap;
}

const addressModeMap: { [key: string]: IGLTextureWrap } = {
    "clamp-to-edge": "clamp-to-edge",
    "repeat": "repeat",
    "mirror-repeat": "mirror-repeat",
};