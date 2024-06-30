import { Texture, TextureMagFilter, TextureMinFilter, TextureWrap } from "../data/Texture";

declare global
{
    interface WebGLRenderingContext
    {
        _textureMap: WeakMap<Texture, WebGLTexture>
    }

    interface WebGLTexture
    {
        minFilter?: TextureMinFilter,
        magFilter?: TextureMagFilter,
        wrapS?: TextureWrap,
        wrapT?: TextureWrap,
        anisotropy?: number,
    }
}

export function getWebGLTexture(gl: WebGLRenderingContext, texture: Texture)
{
    const _textureMap = gl._textureMap;

    let webGLTexture = _textureMap.get(texture);
    if (webGLTexture) return webGLTexture;

    const { textureTarget, flipY, premulAlpha, generateMipmap } = texture;

    webGLTexture = gl.createTexture(); // Create a texture object

    // 设置图片y轴方向
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premulAlpha);
    // 绑定纹理
    gl.bindTexture(gl[textureTarget], webGLTexture);

    // 设置纹理图片
    texture.setTextureData(gl);

    if (generateMipmap)
    {
        gl.generateMipmap(gl[textureTarget]);
    }

    _textureMap.set(texture, webGLTexture);

    return webGLTexture;
}
