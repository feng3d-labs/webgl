import { watcher } from "@feng3d/watcher";
import { ITexture } from "../data/ITexture";
import { defaultBufferSource, defaultImageSource, defaultTexture } from "../runs/runTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _textureMap: WeakMap<ITexture, WebGLTexture>
    }

    interface WebGLTexture
    {
        /**
         * 销毁WebGL纹理。
         */
        destroy: () => void;
    }
}

export function getWebGLTexture(gl: WebGLRenderingContext, texture: ITexture)
{
    const _textureMap = gl._textureMap;

    let webGLTexture = _textureMap.get(texture);
    if (webGLTexture) return webGLTexture;

    webGLTexture = gl.createTexture(); // Create a texture object
    _textureMap.set(texture, webGLTexture);

    const updateSource = () =>
    {
        const { textureTarget, flipY, premulAlpha, generateMipmap, sources } = { ...defaultTexture, ...texture };
        //
        // 设置图片y轴方向
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premulAlpha);
        // 绑定纹理
        gl.bindTexture(gl[textureTarget], webGLTexture);

        sources.forEach((sourceItem) =>
        {
            // 设置纹理图片
            if (textureTarget === "TEXTURE_2D")
            {
                if ("source" in sourceItem)
                {
                    const { level, internalformat, format, type, source } = { ...defaultImageSource, ...sourceItem };
                    gl.texImage2D(gl.TEXTURE_2D, level, gl[internalformat], gl[format], gl[type], source);
                }
                else
                {
                    const { level, internalformat, width, height, border, format, type, pixels } = { ...defaultBufferSource, ...sourceItem };
                    gl.texImage2D(gl.TEXTURE_2D, level, gl[internalformat], width, height, border, gl[format], gl[type], pixels);
                }
            }
            else
            {
                throw `未处理 ${textureTarget}`;
            }
        });

        if (generateMipmap)
        {
            gl.generateMipmap(gl[textureTarget]);
        }
    };

    updateSource();

    watcher.watch(texture, "sources", updateSource);
    watcher.watch(texture, "flipY", updateSource);
    watcher.watch(texture, "generateMipmap", updateSource);
    watcher.watch(texture, "premulAlpha", updateSource);

    // watcher.watch(this as RenderTargetTexture2D, "width", this.invalidate, this);
    // watcher.watch(this as RenderTargetTexture2D, "height", this.invalidate, this);

    // watcher.watch(this as Texture, "format", this.invalidate, this);
    // watcher.watch(this as Texture, "type", this.invalidate, this);

    webGLTexture.destroy = () =>
    {
        _textureMap.delete(texture);
        //
        watcher.unwatch(texture, "sources", updateSource);
        watcher.unwatch(texture, "flipY", updateSource);
        watcher.unwatch(texture, "generateMipmap", updateSource);
        watcher.unwatch(texture, "premulAlpha", updateSource);
    };

    return webGLTexture;
}
