import { getWebGLTexture } from "../caches/getWebGLTexture";
import { Texture } from "../data/Texture";
import { WebGLUniform } from "../runs/runUniforms";

export function active(gl: WebGLRenderingContext, data: Texture, activeInfo?: WebGLUniform)
{
    if (activeInfo)
    {
        // 激活纹理编号
        gl.activeTexture(gl[`TEXTURE${activeInfo.textureID}`]);
    }

    const texture = getWebGLTexture(gl, data);

    // 绑定纹理
    gl.bindTexture(gl[data.textureTarget], texture);

    setTextureParameters(gl, data);

    if (activeInfo)
    {
        // 设置纹理所在采样编号
        gl.uniform1i(activeInfo.location, activeInfo.textureID);
    }

    return texture;
}

function setTextureParameters(gl: WebGLRenderingContext, texture: Texture)
{
    const { textureTarget, type, minFilter, magFilter, wrapS, wrapT, anisotropy } = texture;
    const webGLTexture = getWebGLTexture(gl, texture);

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
            const ext1 = gl.getExtension("OES_texture_float_linear");

            if (type === "FLOAT" && !ext1) return; // verify extension for WebGL 1 and WebGL 2
            // verify extension for WebGL 1 only
            if (!(gl instanceof WebGL2RenderingContext) && type === "HALF_FLOAT")
            {
                const ext2 = gl.getExtension("OES_texture_half_float_linear");
                if (!ext2)
                {
                    return;
                }
            }

            if (anisotropy > 1)
            {
                const ext = gl.getExtension("EXT_texture_filter_anisotropic");
                gl.texParameterf(gl[textureTarget], ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisotropy, gl._capabilities.maxAnisotropy));
            }
        }
        webGLTexture.anisotropy = anisotropy;
    }
}
