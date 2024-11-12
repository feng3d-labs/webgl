import { watcher } from "@feng3d/watcher";
import { GLTextureTarget, IGLTexture } from "../data/IGLTexture";
import { IGLTexturePixelStore } from "../data/IGLTexturePixelStore";
import { defaultBufferSource, defaultImageSource, defaultTexture } from "../runs/runTexture";

declare global
{
    interface WebGLRenderingContext
    {
        _textures: Map<IGLTexture, WebGLTexture>
    }

    interface WebGLTexture
    {
        /**
         * 纹理绑定点。
         *
         * 默认"TEXTURE_2D"。
         */
        textureTarget: GLTextureTarget;

        /**
         * 销毁WebGL纹理。
         */
        destroy: () => void;
    }
}

const defaultTexturePixelStore: IGLTexturePixelStore = {
    packAlignment: 4,
    unpackAlignment: 4,
    unpackFlipY: false,
    unpackPremulAlpha: false,
    unpackColorSpaceConversion: "BROWSER_DEFAULT_WEBGL",
    packRowLength: 0,
    packSkipPixels: 0,
    packSkipRows: 0,
    unpackRowLength: 0,
    unpackImageHeight: 0,
    unpackSkipPixels: 0,
    unpackSkipRows: 0,
    unpackSkipImages: 0,
};

export function getTexture(gl: WebGLRenderingContext, texture: IGLTexture)
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
                    const { level, source, width, height, border } = { ...defaultImageSource, ...sourceItem };
                    if (width && height)
                    {
                        (gl as any as WebGL2RenderingContext).texImage2D(gl[bindTarget], level, gl[internalformat], width, height, border, gl[format], gl[type], source);
                    }
                    else
                    {
                        gl.texImage2D(gl[bindTarget], level, gl[internalformat], gl[format], gl[type], source);
                    }
                }
                else
                {
                    const { level, width, height, border, pixels, srcOffset } = { ...defaultBufferSource, ...sourceItem };
                    if (srcOffset)
                    {
                        (gl as any as WebGL2RenderingContext).texImage2D(gl[bindTarget], level, gl[internalformat], width, height, border, gl[format], gl[type], pixels, srcOffset);
                    }
                    else
                    {
                        gl.texImage2D(gl[bindTarget], level, gl[internalformat], width, height, border, gl[format], gl[type], pixels);
                    }
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
                        const { level, width, height, depth, border, pixels, srcOffset } = { ...defaultBufferSource, ...sourceItem };
                        if (srcOffset)
                        {
                            gl.texImage3D(gl[target], level, gl[internalformat], width, height, depth, border, gl[format], gl[type], pixels, srcOffset);
                        }
                        else
                        {
                            gl.texImage3D(gl[target], level, gl[internalformat], width, height, depth, border, gl[format], gl[type], pixels);
                        }
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
    watcher.watchobject(texture, { pixelStore: { unpackFlipY: undefined, unpackPremulAlpha: undefined } }, updateTexture);
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
        watcher.unwatchobject(texture, { pixelStore: { unpackFlipY: undefined, unpackPremulAlpha: undefined } }, updateTexture);
        watcher.unwatchs(texture, ["sources", "generateMipmap", "internalformat", "format", "type"], updateTexture);
        watcher.unwatch(texture, "writeTextures", writeTexture);
    };

    return webGLTexture;
}

export function deleteTexture(gl: WebGLRenderingContext, texture: IGLTexture)
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
function setTexturePixelStore(gl: WebGLRenderingContext, pixelStore: IGLTexturePixelStore)
{
    const {
        packAlignment,
        unpackAlignment,
        unpackFlipY,
        unpackPremulAlpha,
        unpackColorSpaceConversion,
        packRowLength,
        packSkipPixels,
        packSkipRows,
        unpackRowLength,
        unpackImageHeight,
        unpackSkipPixels,
        unpackSkipRows,
        unpackSkipImages,
    } = { ...defaultTexturePixelStore, ...pixelStore };

    // 设置图片y轴方向
    gl.pixelStorei(gl.PACK_ALIGNMENT, packAlignment);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, unpackAlignment);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, unpackFlipY);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, unpackPremulAlpha);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl[unpackColorSpaceConversion]);

    if (gl instanceof WebGL2RenderingContext)
    {
        gl.pixelStorei(gl.PACK_ROW_LENGTH, packRowLength);
        gl.pixelStorei(gl.PACK_SKIP_PIXELS, packSkipPixels);
        gl.pixelStorei(gl.PACK_SKIP_ROWS, packSkipRows);
        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, unpackRowLength);
        gl.pixelStorei(gl.UNPACK_IMAGE_HEIGHT, unpackImageHeight);
        gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, unpackSkipPixels);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, unpackSkipRows);
        gl.pixelStorei(gl.UNPACK_SKIP_IMAGES, unpackSkipImages);
    }
}