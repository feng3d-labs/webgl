import { ISampler, TextureMagFilter, TextureMinFilter, TextureWrap } from "../data/ISampler";
import { ITexture } from "../data/ITexture";
import { defaultTexture } from "./runTexture";

declare global
{
    interface WebGLTexture
    {
        minFilter?: TextureMinFilter,
        magFilter?: TextureMagFilter,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
        anisotropy?: number,

        /**
         * 采样时使用的最小Lod等级。
         */
        lodMinClamp?: number;

        /**
         * 采样时使用的最大Lod等级。
         */
        lodMaxClamp?: number;
    }
}

export const defaultSampler: ISampler = {
    minFilter: "LINEAR_MIPMAP_LINEAR", magFilter: "LINEAR",
    wrapS: "REPEAT", wrapT: "REPEAT",
    lodMinClamp: 0, lodMaxClamp: 16,
    anisotropy: 1,
};

/**
 * 设置采样参数
 */
export function runSampler(gl: WebGLRenderingContext, webGLTexture: WebGLTexture, texture: ITexture)
{
    const { textureTarget } = { ...defaultTexture, ...texture };
    const { minFilter, magFilter, wrapS, wrapT, anisotropy, lodMinClamp, lodMaxClamp } = { ...defaultSampler, ...texture.sampler };

    // 绑定纹理
    gl.bindTexture(gl[textureTarget], webGLTexture);

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
    if (gl instanceof WebGL2RenderingContext)
    {
        if (webGLTexture.lodMinClamp !== lodMinClamp)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_BASE_LEVEL, lodMinClamp);
            webGLTexture.lodMinClamp = lodMinClamp;
        }
        if (webGLTexture.lodMaxClamp !== lodMaxClamp)
        {
            gl.texParameteri(gl[textureTarget], gl.TEXTURE_MAX_LEVEL, lodMaxClamp);
            webGLTexture.lodMaxClamp = lodMaxClamp;
        }
    }

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
