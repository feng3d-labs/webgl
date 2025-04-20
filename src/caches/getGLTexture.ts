import { Texture, TextureDataSource, TextureImageSource, TextureSize } from "@feng3d/render-api";
import { watcher } from "@feng3d/watcher";
import { getGLTextureFormats } from "./getGLTextureFormats";
import { getGLTextureTarget } from "./getGLTextureTarget";

declare global
{
    interface WebGLTexture
    {
        /**
         * 销毁WebGL纹理。
         */
        destroy: () => void;
    }
}

export const defaultTexturePixelStore: GLTexturePixelStore = {
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

export function getGLTexture(gl: WebGLRenderingContext, texture: Texture)
{
    let webGLTexture = gl._textures.get(texture);
    if (webGLTexture) return webGLTexture;

    // 创建纹理
    const createTexture = () =>
    {
        const target = getGLTextureTarget(texture.dimension);
        const { internalformat, format, type } = getGLTextureFormats(texture.format);

        webGLTexture = gl.createTexture(); // Create a texture object
        gl._textures.set(texture, webGLTexture);

        gl.bindTexture(gl[target], webGLTexture);

        //
        const { sources, generateMipmap } = texture;

        // 设置纹理尺寸
        const [width, height, depth] = texture.size;
        const mipLevelCount = texture.mipLevelCount || 1;

        if (sources)
        {
            sources.forEach((v) =>
            {
                const { textureOrigin, size } = v;
                //
                const mipLevel = v.mipLevel ?? 0;
                const width = size?.[0];
                const height = size?.[1];
                const depthOrArrayLayers = size?.[2];
                const xoffset = textureOrigin?.[0];
                const yoffset = textureOrigin?.[1];
                const zoffset = textureOrigin?.[2];
                if (gl instanceof WebGL2RenderingContext)
                {
                    const imageSource = v as TextureImageSource;
                    if (imageSource.image)
                    {
                        const { image, imageOrigin, flipY, premultipliedAlpha } = imageSource;

                        //
                        const pixelStore: GLTexturePixelStore = {};
                        pixelStore.unpackSkipPixels = imageOrigin?.[0] || 0;
                        pixelStore.unpackSkipRows = imageOrigin?.[1] || 0;
                        pixelStore.unpackFlipY = flipY || false;
                        pixelStore.unpackPremulAlpha = premultipliedAlpha || false;

                        setTexturePixelStore(gl, pixelStore);

                        if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                        {
                            const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(zoffset) : target;
                            if (width && height)
                            {
                                gl.texImage2D(gl[bindTarget], mipLevel, gl[internalformat], width, height, 0, gl[format], gl[type], image);
                            }
                            else
                            {
                                gl.texImage2D(gl[bindTarget], mipLevel, gl[internalformat], gl[format], gl[type], image);
                            }
                        }
                        else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                        {
                            gl.texImage3D(gl[target], mipLevel, gl[internalformat], width, height, depth, 0, gl[format], gl[type], image);
                        }
                        else
                        {
                            console.error(`未处理 ${target} 纹理初始化存储！`);
                        }
                    }
                    else
                    {
                        const bufferSource = v as TextureDataSource;
                        const { data, dataLayout, dataImageOrigin } = bufferSource;

                        //
                        const offset = dataLayout?.offset || 0;

                        //
                        const pixelStore: GLTexturePixelStore = {};
                        pixelStore.unpackSkipPixels = dataImageOrigin?.[0] || 0;
                        pixelStore.unpackSkipRows = dataImageOrigin?.[1] || 0;
                        pixelStore.unpackSkipImages = dataImageOrigin?.[2] || 0;
                        pixelStore.unpackRowLength = dataLayout?.width;
                        pixelStore.unpackImageHeight = dataLayout?.height;

                        setTexturePixelStore(gl, pixelStore);

                        if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                        {
                            const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(zoffset) : target;
                            gl.texImage2D(gl[bindTarget], mipLevel, gl[internalformat], width, height, 0, gl[format], gl[type], data, offset);
                        }
                        else if (target === "TEXTURE_3D" || target === "TEXTURE_2D_ARRAY")
                        {
                            gl.texImage3D(gl[target], mipLevel, gl[internalformat], width, height, depth, 0, gl[format], gl[type], data, offset);
                        }
                        else
                        {
                            console.error(`未处理 ${target} 纹理初始化存储！`);
                        }
                    }
                }
                else
                {
                    const imageSource = v as TextureImageSource;
                    if (imageSource.image)
                    {
                        const { image, imageOrigin, flipY, premultipliedAlpha } = imageSource;

                        //
                        const pixelStore: GLTexturePixelStore = {};
                        pixelStore.unpackSkipPixels = imageOrigin?.[0] || 0;
                        pixelStore.unpackSkipRows = imageOrigin?.[1] || 0;
                        pixelStore.unpackFlipY = flipY || false;
                        pixelStore.unpackPremulAlpha = premultipliedAlpha || false;

                        setTexturePixelStore(gl, pixelStore);

                        if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                        {
                            const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(zoffset) : target;
                            gl.texImage2D(gl[bindTarget], mipLevel, gl[format], gl[format], gl[type], image);
                        }
                        else
                        {
                            console.error(`未处理 ${target} 纹理初始化存储！`);
                        }
                    }
                    else
                    {
                        const bufferSource = v as TextureDataSource;
                        const { data, dataLayout, dataImageOrigin } = bufferSource;

                        //
                        const offset = dataLayout?.offset || 0;

                        //
                        const pixelStore: GLTexturePixelStore = {};
                        pixelStore.unpackSkipPixels = dataImageOrigin?.[0] || 0;
                        pixelStore.unpackSkipRows = dataImageOrigin?.[1] || 0;
                        pixelStore.unpackSkipImages = dataImageOrigin?.[2] || 0;
                        pixelStore.unpackRowLength = dataLayout?.width;
                        pixelStore.unpackImageHeight = dataLayout?.height;

                        setTexturePixelStore(gl, pixelStore);

                        if (target === "TEXTURE_2D" || target === "TEXTURE_CUBE_MAP")
                        {
                            const bindTarget = target === "TEXTURE_CUBE_MAP" ? getTextureCubeMapTarget(zoffset) : target;
                            console.assert(offset === 0, `WebGL1中ITextureDataLayout.offset必须为0`);
                            gl.texImage2D(gl[bindTarget], mipLevel, gl[format], width, height, 0, gl[format], gl[type], data);
                        }
                        else
                        {
                            console.error(`未处理 ${target} 纹理初始化存储！`);
                        }
                    }
                }
            });

            //
            if (generateMipmap)
            {
                gl.generateMipmap(gl[target]);
            }
        }
        else
        {
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
                        gl.texImage2D(gl[target], i, gl[format], width, height, 0, gl[format], gl[type], null);
                    }
                }
                else
                {
                    console.error(`未处理 ${target} 纹理初始化存储！`);
                }
            }
        }
    };
    createTexture();

    const updateSources = () =>
    {
        webGLTexture.destroy();
    };

    watcher.watch(texture, "sources", updateSources);

    // 更新纹理
    const updateTexture = () =>
    {
        const { writeTextures } = texture;
        if (!writeTextures || writeTextures.length === 0) return;

        const target = getGLTextureTarget(texture.dimension);
        const { format, type } = getGLTextureFormats(texture.format);

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
            const imageSource = v as TextureImageSource;
            if (imageSource.image)
            {
                const { image, imageOrigin, flipY, premultipliedAlpha } = imageSource;

                //
                const pixelStore: GLTexturePixelStore = {};
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
            const bufferSource = v as TextureDataSource;
            const { data, dataLayout, dataImageOrigin } = bufferSource;

            //
            const offset = dataLayout?.offset || 0;

            //
            const pixelStore: GLTexturePixelStore = {};
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

                    console.assert(!offset, `WebGL1 不支持 IGLTextureDataSource.dataLayout.offset ！`);
                }
                else
                {
                    console.error(`WebGL1 中 不支持 ${target} 纹理类型！`);
                }
            }
        });
    };
    updateTexture();

    watcher.watchs(texture, ["generateMipmap"], updateTexture);
    watcher.watch(texture, "writeTextures", updateTexture);

    // 监听纹理尺寸发生变化
    const resize = (newValue: TextureSize, oldValue: TextureSize) =>
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
        watcher.unwatch(texture, "sources", updateSources);
        watcher.unwatch(texture, "writeTextures", updateTexture);
        watcher.unwatch(texture, "size", resize);
        //
        delete webGLTexture.destroy;
    };

    return webGLTexture;
}

export function deleteTexture(gl: WebGLRenderingContext, texture: Texture)
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
function setTexturePixelStore(gl: WebGLRenderingContext, pixelStore: GLTexturePixelStore)
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

/**
 * 像素解包打包时参数。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
 */
interface GLTexturePixelStore
{
    /**
     * Packing of pixel data into memory
     *
     * gl.PACK_ALIGNMENT
     *
     * 默认值为 4 。
     */
    packAlignment?: 1 | 2 | 4 | 8;

    /**
     * Unpacking of pixel data from memory.
     *
     * gl.UNPACK_ALIGNMENT
     *
     * 默认值为 4 。
     */
    unpackAlignment?: 1 | 2 | 4 | 8;

    /**
     * 解包图像数据时进行Y轴反转。
     *
     * Flips the source data along its vertical axis if true.
     *
     * gl.UNPACK_FLIP_Y_WEBGL
     *
     * 默认为 false。
     */
    unpackFlipY?: boolean;

    /**
     * 将图像RGB颜色值得每一个分量乘以A。
     *
     * Multiplies the alpha channel into the other color channels
     *
     * gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL
     *
     * 默认为 false。
     */
    unpackPremulAlpha?: boolean;

    /**
     * Default color space conversion or no color space conversion.
     *
     * gl.UNPACK_COLORSPACE_CONVERSION_WEBGL
     *
     * 默认为 "BROWSER_DEFAULT_WEBGL" 。
     */
    unpackColorSpaceConversion?: "BROWSER_DEFAULT_WEBGL" | "NONE";

    /**
     * Number of pixels in a row.
     *
     * gl.PACK_ROW_LENGTH
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    packRowLength?: number;

    /**
     * Number of pixel locations skipped before the first pixel is written into memory.
     *
     * gl.PACK_SKIP_PIXELS
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    packSkipPixels?: number;

    /**
     * Number of rows of pixel locations skipped before the first pixel is written into memory
     *
     * gl.PACK_SKIP_ROWS
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    packSkipRows?: number;

    /**
     * Number of pixels in a row.
     *
     * gl.UNPACK_ROW_LENGTH
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    unpackRowLength?: number;

    /**
     * Image height used for reading pixel data from memory
     *
     * gl.UNPACK_IMAGE_HEIGHT
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    unpackImageHeight?: number;

    /**
     *
     * Number of pixel images skipped before the first pixel is read from memory
     *
     * gl.UNPACK_SKIP_PIXELS
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    unpackSkipPixels?: number;

    /**
     *
     * Number of rows of pixel locations skipped before the first pixel is read from memory
     *
     * gl.UNPACK_SKIP_ROWS
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    unpackSkipRows?: number;

    /**
     *
     * Number of pixel images skipped before the first pixel is read from memory
     *
     * gl.UNPACK_SKIP_IMAGES
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    unpackSkipImages?: number;
}

function getTextureCubeMapTarget(depthOrArrayLayers: number)
{
    const textureCubeMapTarget: GLTextureCubeMapTarget = textureCubeMapTargetMap[depthOrArrayLayers];

    console.assert(!!textureCubeMapTarget, `CubeMap的depthOrArrayLayers值应在[0-5]之间！`);

    return textureCubeMapTarget;
}

const textureCubeMapTargetMap: GLTextureCubeMapTarget[] = [
    "TEXTURE_CUBE_MAP_POSITIVE_X",
    "TEXTURE_CUBE_MAP_NEGATIVE_X",
    "TEXTURE_CUBE_MAP_POSITIVE_Y",
    "TEXTURE_CUBE_MAP_NEGATIVE_Y",
    "TEXTURE_CUBE_MAP_POSITIVE_Z",
    "TEXTURE_CUBE_MAP_NEGATIVE_Z",
];

/**
 * A GLenum specifying the texture target.
 *
 * gl.TEXTURE_CUBE_MAP_POSITIVE_X: Positive X face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_NEGATIVE_X: Negative X face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_POSITIVE_Y: Positive Y face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_NEGATIVE_Y: Negative Y face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_POSITIVE_Z: Positive Z face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_NEGATIVE_Z: Negative Z face for a cube-mapped texture.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
type GLTextureCubeMapTarget =
    | "TEXTURE_CUBE_MAP_POSITIVE_X"
    | "TEXTURE_CUBE_MAP_NEGATIVE_X"
    | "TEXTURE_CUBE_MAP_POSITIVE_Y"
    | "TEXTURE_CUBE_MAP_NEGATIVE_Y"
    | "TEXTURE_CUBE_MAP_POSITIVE_Z"
    | "TEXTURE_CUBE_MAP_NEGATIVE_Z";