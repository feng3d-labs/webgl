import { getSampler } from "../caches/getSampler";
import { IGLSampler, TextureMagFilter, GLTextureMinFilter, GLTextureWrap } from "../data/IGLSampler";

declare global
{
    interface WebGLTexture
    {
        minFilter?: GLTextureMinFilter,
        magFilter?: TextureMagFilter,
        wrapS?: GLTextureWrap,
        wrapT?: GLTextureWrap,
        wrapR?: GLTextureWrap,
        anisotropy?: number,
        lodMinClamp?: number;
        lodMaxClamp?: number;
    }
}

export const defaultSampler: IGLSampler = {
    minFilter: "LINEAR_MIPMAP_LINEAR", magFilter: "LINEAR",
    wrapS: "REPEAT", wrapT: "REPEAT", wrapR: "REPEAT",
    lodMinClamp: 0, lodMaxClamp: 16,
    compareMode: "NONE",
    compare: "LEQUAL",
    anisotropy: 1,
};

/**
 * 设置采样参数
 */
export function runSampler(gl: WebGLRenderingContext, webGLTexture: WebGLTexture, sampler: IGLSampler, textureID: number)
{
    const textureTarget = webGLTexture.textureTarget;

    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLSampler = getSampler(gl, sampler);
        gl.bindSampler(textureID, webGLSampler);
    }
    else
    {
        const { minFilter, magFilter, wrapS, wrapT } = { ...defaultSampler, ...sampler };

        // 设置纹理参数
        if (webGLTexture.minFilter !== minFilter)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_MIN_FILTER, gl[minFilter]);
            webGLTexture.minFilter = minFilter;
        }
        if (webGLTexture.magFilter !== magFilter)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_MAG_FILTER, gl[magFilter]);
            webGLTexture.magFilter = magFilter;
        }
        if (webGLTexture.wrapS !== wrapS)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_WRAP_S, gl[wrapS]);
            webGLTexture.wrapS = wrapS;
        }
        if (webGLTexture.wrapT !== wrapT)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_WRAP_T, gl[wrapT]);
            webGLTexture.wrapT = wrapT;
        }
    }

    //
    const anisotropy = sampler?.anisotropy || defaultSampler.anisotropy;
    if (webGLTexture.anisotropy !== anisotropy)
    {
        const extension = gl.getExtension("EXT_texture_filter_anisotropic");
        if (extension)
        {
            gl.texParameterf(gl[textureTarget], extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, gl._capabilities.maxAnisotropy));
        }
        webGLTexture.anisotropy = anisotropy;
    }
}
