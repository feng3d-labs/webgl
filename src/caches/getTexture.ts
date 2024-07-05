import { watcher } from "@feng3d/watcher";
import { ITexture, ITexturePixelStore, ITextureTarget } from "../data/ITexture";
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
        textureTarget: ITextureTarget;

        /**
         * 销毁WebGL纹理。
         */
        destroy: () => void;
    }
}

const defaultTexturePixelStore: ITexturePixelStore = { unpackFlipY: false, premulAlpha: false };

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
            const { target } = { ...defaultTexture, ...texture };
            const { levels, width, height, depth } = storage;

            gl.bindTexture(gl[target], webGLTexture);

            if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
            {
                gl.texStorage2D(gl[target], levels, gl[internalformat], width, height);
            }
            else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
            {
                gl.texStorage3D(gl[target], levels, gl[internalformat], width, height, depth);
            }
            else
            {
                console.error(`未处理 ${target} 纹理初始化存储！`);
            }
        }
    }

    const updateTexture = () =>
    {
        const { target, generateMipmap, format, type, sources, pixelStore } = { ...defaultTexture, ...texture };

        setTexturePixelStore(gl, pixelStore);
        // 绑定纹理
        gl.bindTexture(gl[target], webGLTexture);

        webGLTexture.textureTarget = target;

        sources?.forEach((sourceItem) =>
        {
            // 设置纹理图片
            if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
            {
                const bindTarget = target === "TEXTURE_CUBE_MAP" ? sourceItem.cubeTarget : target;

                if ("source" in sourceItem)
                {
                    const { level, source } = { ...defaultImageSource, ...sourceItem };
                    gl.texImage2D(gl[bindTarget], level, gl[internalformat], gl[format], gl[type], source);
                }
                else
                {
                    const { level, width, height, border, pixels } = { ...defaultBufferSource, ...sourceItem };
                    gl.texImage2D(gl[bindTarget], level, gl[internalformat], width, height, border, gl[format], gl[type], pixels);
                }
            }
            else if (target === "TEXTURE_2D_ARRAY" || target === "TEXTURE_3D")
            {
                if (gl instanceof WebGL2RenderingContext)
                {
                    if ("source" in sourceItem)
                    {
                        const { level, width, height, depth, border, source } = { ...defaultBufferSource, ...sourceItem };
                        gl.texImage3D(gl[target], level, gl[internalformat], width, height, depth, border, gl[format], gl[type], source);
                    }
                    else
                    {
                        const { level, width, height, depth, border, pixels } = { ...defaultBufferSource, ...sourceItem };
                        gl.texImage3D(gl[target], level, gl[internalformat], width, height, depth, border, gl[format], gl[type], pixels);
                    }
                }
            }
            else
            {
                throw `未处理 ${target}`;
            }
        });

        if (generateMipmap)
        {
            gl.generateMipmap(gl[target]);
        }
    };
    updateTexture();
    watcher.watchobject(texture, { pixelStore: { unpackFlipY: undefined, premulAlpha: undefined } }, updateTexture);
    watcher.watchs(texture, ["sources", "generateMipmap", "internalformat", "format", "type"], updateTexture);

    const writeTexture = () =>
    {
        const { writeTextures } = texture;
        writeTextures?.forEach((v) =>
        {
            const { target, format, type } = { ...defaultTexture, ...texture };
            gl.bindTexture(gl[target], webGLTexture);

            const { level, xoffset, yoffset, zoffset, width, height, depth, source, srcData, srcOffset, cubeTarget } = v;

            if (gl instanceof WebGL2RenderingContext)
            {
                if (source)
                {
                    if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                    {
                        const bindTarget = target === "TEXTURE_CUBE_MAP" ? cubeTarget : target;

                        if (width && height)
                        {
                            gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], source);
                        }
                        else
                        {
                            gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, gl[format], gl[type], source);
                        }
                    }
                    else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                    {
                        gl.texSubImage3D(gl[target], level, xoffset, yoffset, zoffset, width, height, depth, gl[format], gl[type], source);
                    }
                    else
                    {
                        console.error(`未处理 WebGL1 中 ${target} 纹理类型的图片资源上传！`);
                    }
                }
                else
                {
                    // eslint-disable-next-line no-lonely-if
                    if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                    {
                        const bindTarget = target === "TEXTURE_CUBE_MAP" ? cubeTarget : target;

                        gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], srcData, srcOffset || 0);
                    }
                    else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                    {
                        gl.texSubImage3D(gl[target], level, xoffset, yoffset, zoffset, width, height, depth, gl[format], gl[type], srcData, srcOffset || 0);
                    }
                    else
                    {
                        console.error(`未处理 WebGL1 中 ${target} 纹理类型的像素资源上传。`);
                    }
                }
            }
            // 处理 WebGL1
            else
            {
                // eslint-disable-next-line no-lonely-if
                if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                {
                    const bindTarget = target === "TEXTURE_CUBE_MAP" ? cubeTarget : target;
                    if (source)
                    {
                        gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, gl[format], gl[type], source);
                    }
                    else
                    {
                        gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], srcData);
                    }
                }
                else
                {
                    console.error(`WebGL1 中 不支持 ${target} 纹理类型！`);
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
        watcher.unwatchobject(texture, { pixelStore: { unpackFlipY: undefined, premulAlpha: undefined } }, updateTexture);
        watcher.unwatchs(texture, ["sources", "generateMipmap", "internalformat", "format", "type"], updateTexture);
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

/**
 * 设置像素解包打包时参数。
 *
 * @param gl
 * @param pixelStore 像素解包打包时参数。
 */
function setTexturePixelStore(gl: WebGLRenderingContext, pixelStore: ITexturePixelStore)
{
    const { unpackFlipY: flipY, premulAlpha } = { ...defaultTexturePixelStore, ...pixelStore };
    //
    // 设置图片y轴方向
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premulAlpha);
}