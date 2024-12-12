import { getGLSampler } from "../caches/getGLSampler";
import { IGLTextureMinFilter, IGLTextureWrap, IGLSampler, IGLTextureMagFilter } from "../data/IGLSampler";
import { IGLTextureTarget } from "../data/IGLTexture";

declare global
{
    interface WebGLTexture
    {
        minFilter?: IGLTextureMinFilter,
        magFilter?: IGLTextureMagFilter,
        wrapS?: IGLTextureWrap,
        wrapT?: IGLTextureWrap,
        wrapR?: IGLTextureWrap,
        anisotropy?: number,
        lodMinClamp?: number;
        lodMaxClamp?: number;
    }
}

/**
 * 设置采样参数
 */
export function runSampler(gl: WebGLRenderingContext, textureTarget: IGLTextureTarget, webGLTexture: WebGLTexture, sampler: IGLSampler, textureID: number)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLSampler = getGLSampler(gl, sampler);
        gl.bindSampler(textureID, webGLSampler);
    }
    else
    {
        const minFilter: IGLTextureMinFilter = sampler.minFilter || "LINEAR_MIPMAP_LINEAR";
        const magFilter: IGLTextureMagFilter = sampler.magFilter || "LINEAR";
        const wrapS: IGLTextureWrap = sampler.wrapS || "REPEAT";
        const wrapT: IGLTextureWrap = sampler.wrapT || "REPEAT";

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
    const anisotropy = sampler?.anisotropy || 1;
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
