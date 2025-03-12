import { IAddressMode, IFilterMode, Sampler } from "@feng3d/render-api";
import { GLSamplerCompareMode, IGLTextureMagFilter, IGLTextureMinFilter, IGLTextureWrap } from "../data/IGLSampler";
import { getIGLCompareFunction } from "../runs/runDepthState";

declare global
{
    interface WebGLRenderingContext
    {
        _samplers: Map<Sampler, WebGLSampler>;
    }
}

export function getGLSampler(gl: WebGLRenderingContext, sampler?: Sampler)
{
    let webGLSampler = gl._samplers.get(sampler);
    if (webGLSampler) return webGLSampler;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLSampler = gl.createSampler();
        gl._samplers.set(sampler, webGLSampler);

        const minFilter: IGLTextureMinFilter = getIGLTextureMinFilter(sampler.minFilter, sampler.mipmapFilter);
        const magFilter: IGLTextureMagFilter = getIGLTextureMagFilter(sampler.magFilter);
        const wrapS: IGLTextureWrap = getIGLTextureWrap(sampler.addressModeU);
        const wrapT: IGLTextureWrap = getIGLTextureWrap(sampler.addressModeV);
        const wrapR: IGLTextureWrap = getIGLTextureWrap(sampler.addressModeW);
        const lodMinClamp = sampler.lodMinClamp || 0;
        const lodMaxClamp = sampler.lodMaxClamp || 16;
        const compareMode: GLSamplerCompareMode = sampler.compare ? "COMPARE_REF_TO_TEXTURE" : "NONE";
        const compare = getIGLCompareFunction(sampler.compare ?? "less-equal");

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

export function deleteSampler(gl: WebGLRenderingContext, sampler?: Sampler)
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
    "clamp-to-edge": "CLAMP_TO_EDGE",
    repeat: "REPEAT",
    "mirror-repeat": "MIRRORED_REPEAT",
};

export function getIGLTextureMinFilter(minFilter: IFilterMode = "nearest", mipmapFilter?: IFilterMode): IGLTextureMinFilter
{
    let glMinFilter: IGLTextureMinFilter;
    if (minFilter === "linear")
    {
        if (mipmapFilter === "linear")
        {
            glMinFilter = "LINEAR_MIPMAP_LINEAR";
        }
        else if (mipmapFilter === "nearest")
        {
            glMinFilter = "LINEAR_MIPMAP_NEAREST";
        }
        else
        {
            glMinFilter = "LINEAR";
        }
    }
    else
    {
        if (mipmapFilter === "linear")
        {
            glMinFilter = "NEAREST_MIPMAP_LINEAR";
        }
        else if (mipmapFilter === "nearest")
        {
            glMinFilter = "NEAREST_MIPMAP_NEAREST";
        }
        else
        {
            glMinFilter = "NEAREST";
        }
    }

    return glMinFilter;
}

export function getIGLTextureMagFilter(magFilter: IFilterMode = "nearest")
{
    const glMagFilter: IGLTextureMagFilter = magFilterMap[magFilter];

    console.assert(!!glMagFilter, `接收到错误值，请从 ${Object.keys(magFilterMap).toString()} 中取值！`);

    return glMagFilter;
}

const magFilterMap: { [key: string]: IGLTextureMagFilter } = {
    nearest: "NEAREST",
    linear: "LINEAR",
};