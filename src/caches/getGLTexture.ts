import { ITextureSize } from "@feng3d/render-api";
import { watcher } from "@feng3d/watcher";
import { IGLTexture, IGLTextureDataSource, IGLTextureImageSource, IGLTextureTarget } from "../data/IGLTexture";
import { IGLTexturePixelStore } from "../data/IGLTexturePixelStore";
import { getTextureCubeMapTarget } from "../utils/getTextureCubeMapTarget";
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
        textureTarget: IGLTextureTarget;

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

export function getGLTexture(gl: WebGLRenderingContext, texture: IGLTexture)
{
    let webGLTexture = gl._textures.get(texture);
    if (webGLTexture) return webGLTexture;

    // 创建纹理
    const createTexture = () =>
    {
        const target = getIGLTextureTarget(texture.dimension);
        const { internalformat, format, type } = getIGLTextureFormats(texture.format);

        webGLTexture = gl.createTexture(); // Create a texture object
        gl._textures.set(texture, webGLTexture);

        gl.bindTexture(gl[target], webGLTexture);

        webGLTexture.textureTarget = target;

        // 设置纹理尺寸
        const [width, height, depth] = texture.size;
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
    }
    createTexture();

    // 更新纹理
    const updateTexture = () =>
    {
        const { sources: writeTextures } = texture;
        if (!writeTextures || writeTextures.length === 0) return;

        const { generateMipmap } = texture;

        const target = getIGLTextureTarget(texture.dimension);
        const { format, type } = getIGLTextureFormats(texture.format);

        gl.bindTexture(gl[target], webGLTexture);

        writeTextures.forEach((v) =>
        {
            const { mipLevel, textureOrigin, size } = v;
            //
            const width = size?.[0];
            const height = size?.[1];
            const depthOrArrayLayers = size?.[2];
            const xoffset = textureOrigin?.[0];
            const yoffset = textureOrigin?.[1];
            const zoffset = textureOrigin?.[2];

            // 处理图片资源
            const imageSource = v as IGLTextureImageSource;
            if (imageSource.image)
            {
                const { image, imageOrigin, flipY, premultipliedAlpha } = imageSource;

                //
                const pixelStore: IGLTexturePixelStore = {};
                pixelStore.unpackSkipPixels = imageOrigin?.[0] || 0;
                pixelStore.unpackSkipRows = imageOrigin?.[1] || 0;
                pixelStore.unpackFlipY = flipY || false;
                pixelStore.unpackPremulAlpha = premultipliedAlpha || false;

                setTexturePixelStore(gl, pixelStore);

                if (gl instanceof WebGL2RenderingContext)
                {
                    if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                    {
                        const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(depthOrArrayLayers) : target;

                        if (width && height)
                        {
                            gl.texSubImage2D(gl[bindTarget], mipLevel, xoffset, yoffset, width, height, gl[format], gl[type], image);
                        }
                        else
                        {
                            gl.texSubImage2D(gl[bindTarget], mipLevel, xoffset, yoffset, gl[format], gl[type], image);
                        }
                    }
                    else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                    {
                        gl.texSubImage3D(gl[target], mipLevel, xoffset, yoffset, zoffset, width, height, depthOrArrayLayers, gl[format], gl[type], image);
                    }
                    else
                    {
                        console.error(`未处理 WebGL1 中 ${target} 纹理类型的图片资源上传！`);
                    }
                }
                // 处理 WebGL1
                else
                {
                    // eslint-disable-next-line no-lonely-if
                    if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                    {
                        const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(depthOrArrayLayers) : target;

                        gl.texSubImage2D(gl[bindTarget], mipLevel, xoffset, yoffset, gl[format], gl[type], image);
                    }
                    else
                    {
                        console.error(`WebGL1 中 不支持 ${target} 纹理类型！`);
                    }
                }
                return;
            }

            // 处理数据资源
            const bufferSource = v as IGLTextureDataSource;
            const { data, dataLayout, dataImageOrigin } = bufferSource;

            //
            const offset = dataLayout?.offset || 0;

            //
            const pixelStore: IGLTexturePixelStore = {};
            pixelStore.unpackSkipPixels = dataImageOrigin?.[0] || 0;
            pixelStore.unpackSkipRows = dataImageOrigin?.[1] || 0;
            pixelStore.unpackSkipImages = dataImageOrigin?.[2] || 0;
            pixelStore.unpackRowLength = dataLayout?.width;
            pixelStore.unpackImageHeight = dataLayout?.height;

            setTexturePixelStore(gl, pixelStore);

            if (gl instanceof WebGL2RenderingContext)
            {
                // eslint-disable-next-line no-lonely-if
                if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                {
                    const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(depthOrArrayLayers) : target;

                    gl.texSubImage2D(gl[bindTarget], mipLevel, xoffset, yoffset, width, height, gl[format], gl[type], data, offset);
                }
                else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                {
                    gl.texSubImage3D(gl[target], mipLevel, xoffset, yoffset, zoffset, width, height, depthOrArrayLayers, gl[format], gl[type], data, offset);
                }
                else
                {
                    console.error(`未处理 WebGL1 中 ${target} 纹理类型的像素资源上传。`);
                }
            }
            // 处理 WebGL1
            else
            {
                // eslint-disable-next-line no-lonely-if
                if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                {
                    const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(depthOrArrayLayers) : target;

                    gl.texSubImage2D(gl[bindTarget], mipLevel, xoffset, yoffset, width, height, gl[format], gl[type], data);

                    console.assert(!offset, `WebGL1 不支持 IGLTextureDataSource.dataLayout.offset ！`)
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
    };
    updateTexture();

    watcher.watchs(texture, ["generateMipmap"], updateTexture);
    watcher.watch(texture, "sources", updateTexture);

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
        watcher.unwatchs(texture, ["generateMipmap"], updateTexture);
        watcher.unwatch(texture, "sources", updateTexture);
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

    //
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