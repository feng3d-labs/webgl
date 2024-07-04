import { watcher } from "@feng3d/watcher";
import { ITexture, TextureTarget } from "../data/ITexture";
import { defaultBufferSource, defaultImageSource, defaultTexture } from "../runs/runTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _textures: Map<ITexture, WebGLTexture>
    }

    interface WebGLTexture
    {
        /**
         * 纹理绑定点。
         *
         * 默认"TEXTURE_2D"。
         */
        textureTarget: TextureTarget;

        /**
         * 销毁WebGL纹理。
         */
        destroy: () => void;
    }
}

export function getTexture(gl: WebGLRenderingContext, texture: ITexture)
{
    let webGLTexture = gl._textures.get(texture);
    if (webGLTexture) return webGLTexture;

    webGLTexture = gl.createTexture(); // Create a texture object
    gl._textures.set(texture, webGLTexture);

    //
    const internalformat = texture.internalformat || defaultTexture.internalformat;
    const storage = texture.storage;
    if (gl instanceof WebGL2RenderingContext)
    {
        if (storage)
        {
            const { textureTarget } = { ...defaultTexture, ...texture };
            const { levels, width, height, depth } = storage;

            gl.bindTexture(gl[textureTarget], webGLTexture);

            if (textureTarget === "TEXTURE_2D")
            {
                gl.texStorage2D(gl[textureTarget], levels, gl[internalformat], width, height);
            }
            else if (textureTarget === "TEXTURE_3D")
            {
                gl.texStorage3D(gl[textureTarget], levels, gl[internalformat], width, height, depth);
            }
            else
            {
                console.error(`未处理 ${textureTarget} 纹理初始化存储！`);
            }
        }
    }

    const updateTexture = () =>
    {
        const { textureTarget, flipY, premulAlpha, generateMipmap, format, type, sources } = { ...defaultTexture, ...texture };
        //
        // 设置图片y轴方向
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premulAlpha);
        // 绑定纹理
        gl.bindTexture(gl[textureTarget], webGLTexture);

        webGLTexture.textureTarget = textureTarget;

        sources?.forEach((sourceItem) =>
        {
            // 设置纹理图片
            if (textureTarget === "TEXTURE_2D")
            {
                if ("source" in sourceItem)
                {
                    const { level, source } = { ...defaultImageSource, ...sourceItem };
                    gl.texImage2D(gl[textureTarget], level, gl[internalformat], gl[format], gl[type], source);
                }
                else
                {
                    const { level, width, height, border, pixels } = { ...defaultBufferSource, ...sourceItem };
                    gl.texImage2D(gl[textureTarget], level, gl[internalformat], width, height, border, gl[format], gl[type], pixels);
                }
            }
            else if (textureTarget === "TEXTURE_2D_ARRAY" || textureTarget === "TEXTURE_3D")
            {
                if (gl instanceof WebGL2RenderingContext)
                {
                    if ("source" in sourceItem)
                    {
                        console.error(`未处理  ${textureTarget}`);
                    }
                    else
                    {
                        const { level, width, height, depth, border, pixels } = { ...defaultBufferSource, ...sourceItem };
                        gl.texImage3D(gl[textureTarget],
                            level, gl[internalformat], width, height,
                            depth,
                            border, gl[format], gl[type], pixels);
                    }
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
    updateTexture();
    watcher.watchs(texture, ["sources", "flipY", "generateMipmap", "premulAlpha", "internalformat", "format", "type"], updateTexture);

    const writeTexture = () =>
    {
        const { writeTextures } = texture;
        writeTextures?.forEach((v) =>
        {
            const { textureTarget, format, type } = { ...defaultTexture, ...texture };
            gl.bindTexture(gl[textureTarget], webGLTexture);

            const { level, xoffset, yoffset, zoffset, width, height, depth, source, srcData, srcOffset } = v;

            if (gl instanceof WebGL2RenderingContext)
            {
                if (source)
                {
                    if (textureTarget === "TEXTURE_2D")
                    {
                        if (width && height)
                        {
                            gl.texSubImage2D(gl[textureTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], source);
                        }
                        else
                        {
                            gl.texSubImage2D(gl[textureTarget], level, xoffset, yoffset, gl[format], gl[type], source);
                        }
                    }
                    else if (textureTarget === "TEXTURE_3D")
                    {
                        gl.texSubImage3D(gl[textureTarget], level, xoffset, yoffset, zoffset, width, height, depth, gl[format], gl[type], source);
                    }
                    else
                    {
                        console.error(`未处理 WebGL1 中 ${textureTarget} 纹理类型的图片资源上传。`);
                    }
                }
                else
                {
                    // eslint-disable-next-line no-lonely-if
                    if (textureTarget === "TEXTURE_2D")
                    {
                        gl.texSubImage2D(gl[textureTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], srcData, srcOffset || 0);
                    }
                    else if (textureTarget === "TEXTURE_3D")
                    {
                        gl.texSubImage3D(gl[textureTarget], level, xoffset, yoffset, zoffset, width, height, depth, gl[format], gl[type], srcData, srcOffset || 0);
                    }
                    else
                    {
                        console.error(`未处理 WebGL1 中 ${textureTarget} 纹理类型的像素资源上传。`);
                    }
                }
            }
            // 处理 WebGL1
            else
            {
                // eslint-disable-next-line no-lonely-if
                if (textureTarget === "TEXTURE_2D")
                {
                    if (source)
                    {
                        gl.texSubImage2D(gl[textureTarget], level, xoffset, yoffset, gl[format], gl[type], source);
                    }
                    else
                    {
                        gl.texSubImage2D(gl[textureTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], srcData);
                    }
                }
                else
                {
                    console.error(`未处理 WebGL1 中 ${textureTarget} 纹理类型的图片资源上传。`);
                }
            }
        });
    };
    writeTexture();
    watcher.watch(texture, "writeTextures", writeTexture);

    // watcher.watch(this as RenderTargetTexture2D, "width", this.invalidate, this);
    // watcher.watch(this as RenderTargetTexture2D, "height", this.invalidate, this);

    webGLTexture.destroy = () =>
    {
        watcher.unwatchs(texture, ["sources", "flipY", "generateMipmap", "premulAlpha", "internalformat", "format", "type"], updateTexture);
        watcher.unwatch(texture, "writeTextures", writeTexture);
    };

    return webGLTexture;
}

export function deleteTexture(gl: WebGLRenderingContext, texture: ITexture)
{
    const webGLTexture = gl._textures.get(texture);
    if (!webGLTexture) return;

    gl._textures.delete(texture);
    webGLTexture.destroy();
    delete webGLTexture.destroy;
    //
    gl.deleteTexture(webGLTexture);
}