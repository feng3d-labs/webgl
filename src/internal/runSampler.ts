import { Sampler } from '@feng3d/render-api';
import { getGLSampler, getIGLTextureMagFilter, getIGLTextureMinFilter, getIGLTextureWrap, GLTextureMagFilter, GLTextureMinFilter, GLTextureWrap } from '../caches/getGLSampler';
import { GLTextureTarget } from '../caches/getGLTextureTarget';

declare global
{
    interface WebGLTexture
    {
        minFilter?: GLTextureMinFilter,
        magFilter?: GLTextureMagFilter,
        wrapS?: GLTextureWrap,
        wrapT?: GLTextureWrap,
        wrapR?: GLTextureWrap,
        maxAnisotropy?: number,
        lodMinClamp?: number;
        lodMaxClamp?: number;
    }
}

/**
 * 设置采样参数
 */
export function runSampler(gl: WebGLRenderingContext, textureTarget: GLTextureTarget, webGLTexture: WebGLTexture, sampler: Sampler, textureID: number)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLSampler = getGLSampler(gl, sampler);
        gl.bindSampler(textureID, webGLSampler);
    }
    else
    {
        const minFilter = getIGLTextureMinFilter(sampler.minFilter, sampler.mipmapFilter);
        const magFilter = getIGLTextureMagFilter(sampler.magFilter);
        const wrapS = getIGLTextureWrap(sampler.addressModeU);
        const wrapT = getIGLTextureWrap(sampler.addressModeV);

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
    const maxAnisotropy = sampler?.maxAnisotropy || 1;
    if (webGLTexture.maxAnisotropy !== maxAnisotropy)
    {
        const extension = gl.getExtension('EXT_texture_filter_anisotropic');
        if (extension)
        {
            gl.texParameterf(gl[textureTarget], extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(maxAnisotropy, gl._capabilities.maxAnisotropy));
        }
        webGLTexture.maxAnisotropy = maxAnisotropy;
    }
}

