import { ITextureSize } from "@feng3d/render-api";
import { watcher } from "@feng3d/watcher";
import { GLTextureTarget, IGLBufferSource, IGLImageSource, IGLTexture } from "../data/IGLTexture";
import { IGLTexturePixelStore } from "../data/IGLTexturePixelStore";
import { getIGLTextureSize, getIGLTextureSourcesSize } from "../internal";
import { getIGLTextureFormats } from "./getIGLTextureFormats";
import { getIGLTextureTarget } from "./getIGLTextureTarget";

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

export const defaultTexturePixelStore: IGLTexturePixelStore = {
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

    const { dimension, format: format0 } = texture;
    const target = getIGLTextureTarget(dimension);

    gl.bindTexture(gl[target], webGLTexture);
    webGLTexture.textureTarget = target;

    const textureFormat = getIGLTextureFormats(format0);
    const { internalformat, format, type } = textureFormat;

    //
    const size = texture.size = getIGLTextureSize(texture);

    // 设置纹理尺寸
    const [width, height, depth] = size;
    const mipLevelCount = texture.mipLevelCount || 1;
    if (gl instanceof WebGL2RenderingContext)
    {

        if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
        {
            gl.texStorage2D(gl[target], mipLevelCount, gl[internalformat], width, height);
        }
        else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
        {
            gl.texStorage3D(gl[target], mipLevelCount, gl[internalformat], width, height, depth);
        }
        else
        {
            console.error(`未处理 ${target} 纹理初始化存储！`);
        }
    }
    else
    {
        if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
        {
            for (let i = 0; i < mipLevelCount; i++)
            {
                gl.texImage2D(gl[target], i, gl[format], width, height, 0, gl[format], gl[type], null)
            }
        }
        else
        {
            console.error(`未处理 ${target} 纹理初始化存储！`);
        }
    }

    // 更新纹理
    const updateTexture = () =>
    {
        const { sources } = texture;

        if (!sources || sources.length === 0) return;

        // 处理纹理尺寸发生变化。
        const currentSize = getIGLTextureSourcesSize(sources);
        if (currentSize[0] !== size[0] || currentSize[1] !== size[1] || currentSize[2] !== size[2])
        {
            texture.size = currentSize;
            return;
        }

        const writeTextures = texture.writeTextures || [];
        sources.forEach((v) =>
        {
            const imageSource = v as IGLImageSource
            if (imageSource.source)
            {
                const { cubeTarget, level, source, width, height, depthOrArrayLayers } = imageSource;

                writeTextures.push({ cubeTarget, level, xoffset: 0, yoffset: 0, zoffset: 0, width, height, depthOrArrayLayers, source });
            }
            else
            {
                const imageSource = v as IGLBufferSource;

                const { cubeTarget, level, width, height, depthOrArrayLayers, pixels, pixelsOffset } = imageSource;
                writeTextures.push({ cubeTarget, level, xoffset: 0, yoffset: 0, zoffset: 0, width, height, depthOrArrayLayers, pixels, pixelsOffset });
            }
        });
        texture.writeTextures = writeTextures;
    };
    updateTexture();
    watcher.watchobject(texture, { pixelStore: { unpackFlipY: undefined, unpackPremulAlpha: undefined } }, updateTexture);
    watcher.watchs(texture, ["sources", "generateMipmap"], updateTexture);

    const writeTexture = () =>
    {
        const { generateMipmap, writeTextures, pixelStore } = texture;

        if (!writeTextures || writeTextures.length === 0) return;

        gl.bindTexture(gl[target], webGLTexture);

        setTexturePixelStore(gl, pixelStore);

        writeTextures.forEach((v) =>
        {
            const { level, xoffset, yoffset, zoffset, width, height, depthOrArrayLayers, source, pixels, pixelsOffset, cubeTarget } = v;

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
                        gl.texSubImage3D(gl[target], level, xoffset, yoffset, zoffset, width, height, depthOrArrayLayers, gl[format], gl[type], source);
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

                        gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], pixels, pixelsOffset || 0);
                    }
                    else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                    {
                        gl.texSubImage3D(gl[target], level, xoffset, yoffset, zoffset, width, height, depthOrArrayLayers, gl[format], gl[type], pixels, pixelsOffset || 0);
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
                        gl.texSubImage2D(gl[bindTarget], level, xoffset, yoffset, width, height, gl[format], gl[type], pixels);
                    }
                }
                else
                {
                    console.error(`WebGL1 中 不支持 ${target} 纹理类型！`);
                }
            }
        });
        if (generateMipmap)
        {
            gl.generateMipmap(gl[target]);
        }
        texture.writeTextures = null;
    };
    writeTexture();
    watcher.watch(texture, "writeTextures", writeTexture);

    // 监听纹理尺寸发生变化
    const resize = (newValue: ITextureSize, oldValue: ITextureSize) =>
    {
        if (!!newValue && !!oldValue)
        {
            if (newValue[0] === oldValue[0]
                && newValue[1] === oldValue[1]
                && (newValue[2] || 1) === (oldValue[2] || 1)
            )
            {
                return;
            }
        }

        webGLTexture.destroy();
    };
    watcher.watch(texture, "size", resize);

    webGLTexture.destroy = () =>
    {
        //
        gl.deleteTexture(webGLTexture);
        gl._textures.delete(texture);
        //
        watcher.unwatchobject(texture, { pixelStore: { unpackFlipY: undefined, unpackPremulAlpha: undefined } }, updateTexture);
        watcher.unwatchs(texture, ["sources", "generateMipmap"], updateTexture);
        watcher.unwatch(texture, "writeTextures", writeTexture);
        watcher.unwatch(texture, "size", resize);
        //
        delete webGLTexture.destroy;
    };

    return webGLTexture;
}

export function deleteTexture(gl: WebGLRenderingContext, texture: IGLTexture)
{
    const webGLTexture = gl._textures.get(texture);
    if (!webGLTexture) return;

    webGLTexture.destroy();
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