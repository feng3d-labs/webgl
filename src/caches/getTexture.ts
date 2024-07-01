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

export function getTexture(gl: WebGLRenderingContext, texture: ITexture)
{
    let webGLTexture = gl._textureMap.get(texture);
    if (webGLTexture) return webGLTexture;

    webGLTexture = gl.createTexture(); // Create a texture object
    gl._textureMap.set(texture, webGLTexture);

    const updateSource = () =>
    {
        const { textureTarget, flipY, premulAlpha, generateMipmap, internalformat, format, type, sources } = { ...defaultTexture, ...texture };
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
                    const { level, source } = { ...defaultImageSource, ...sourceItem };
                    gl.texImage2D(gl.TEXTURE_2D, level, gl[internalformat], gl[format], gl[type], source);
                }
                else
                {
                    const { level, width, height, border, pixels } = { ...defaultBufferSource, ...sourceItem };
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

    watcher.watchs(texture, ["sources", "flipY", "generateMipmap", "premulAlpha", "internalformat", "format", "type"], updateSource);

    // watcher.watch(this as RenderTargetTexture2D, "width", this.invalidate, this);
    // watcher.watch(this as RenderTargetTexture2D, "height", this.invalidate, this);

    webGLTexture.destroy = () =>
    {
        gl._textureMap.delete(texture);
        //
        watcher.unwatchs(texture, ["sources", "flipY", "generateMipmap", "premulAlpha", "internalformat", "format", "type"], updateSource);
    };

    return webGLTexture;
}

export function deleteTexture(gl: WebGLRenderingContext, texture: ITexture)
{
    const webGLTexture = gl._textureMap.get(texture);
    if (!webGLTexture) return;

    gl._textureMap.delete(texture);
    webGLTexture.destroy();
    //
    gl.deleteTexture(webGLTexture);
}