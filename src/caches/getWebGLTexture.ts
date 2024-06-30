import { ITexture } from "../data/ITexture";
import { defaultTexture } from "../runs/runTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _textureMap: WeakMap<ITexture, WebGLTexture>
    }
}

export function getWebGLTexture(gl: WebGLRenderingContext, texture: ITexture)
{
    const _textureMap = gl._textureMap;

    let webGLTexture = _textureMap.get(texture);
    if (webGLTexture) return webGLTexture;

    const { textureTarget, flipY, premulAlpha, generateMipmap, format, type, source, size } = { ...defaultTexture, ...texture };

    webGLTexture = gl.createTexture(); // Create a texture object

    // 设置图片y轴方向
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premulAlpha);
    // 绑定纹理
    gl.bindTexture(gl[textureTarget], webGLTexture);

    // 设置纹理图片
    if (textureTarget === "TEXTURE_2D")
    {
        if (source[0])
        {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl[format], gl[format], gl[type], source[0]);
        }
        else
        {
            const [width, height] = size;
            gl.texImage2D(gl.TEXTURE_2D, 0, gl[format], width, height, 0, gl[format], gl[type], null);
        }
    }

    if (generateMipmap)
    {
        gl.generateMipmap(gl[textureTarget]);
    }

    // watcher.watch(this as Texture2D, "source", this.invalidate, this);
    // watcher.watch(this as RenderTargetTexture2D, "width", this.invalidate, this);
    // watcher.watch(this as RenderTargetTexture2D, "height", this.invalidate, this);

    // watcher.watch(this as Texture, "format", this.invalidate, this);
    // watcher.watch(this as Texture, "type", this.invalidate, this);
    // watcher.watch(this as Texture, "generateMipmap", this.invalidate, this);
    // watcher.watch(this as Texture, "flipY", this.invalidate, this);
    // watcher.watch(this as Texture, "premulAlpha", this.invalidate, this);

    _textureMap.set(texture, webGLTexture);

    return webGLTexture;
}
