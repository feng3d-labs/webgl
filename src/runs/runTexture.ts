import { getWebGLTexture } from "../caches/getWebGLTexture";
import { ITexture } from "../data/ITexture";
import { WebGLUniform } from "./runUniforms";

export const defaultTexture: ITexture = {
    textureTarget: "TEXTURE_2D",
    format: "RGBA",
    type: "UNSIGNED_BYTE",
    generateMipmap: true,
    flipY: false,
    premulAlpha: false,
    minFilter: "LINEAR_MIPMAP_LINEAR",
    magFilter: "LINEAR",
    wrapS: "REPEAT",
    wrapT: "REPEAT",
    anisotropy: 1,
};

export function runTexture(gl: WebGLRenderingContext, texture: ITexture, activeInfo: WebGLUniform)
{
    gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);

    const webGLTexture = getWebGLTexture(gl, texture);
    // 设置纹理所在采样编号
    gl.uniform1i(activeInfo.location, activeInfo.textureID);

    setTextureParameters(gl, webGLTexture, texture);

    return webGLTexture;
}

/**
 * 设置采样参数
 */
function setTextureParameters(gl: WebGLRenderingContext, webGLTexture: WebGLTexture, texture: ITexture)
{
    const { textureTarget, type, minFilter, magFilter, wrapS, wrapT, anisotropy } = { ...defaultTexture, ...texture };

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
