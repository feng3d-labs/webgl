/**
 * 像素解包打包时参数。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
 */
export interface IGLTexturePixelStore1
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
     * gl.UNPACK_SKIP_IMAGES
     *
     * 默认值为 0 。
     *
     * 仅 WebGL2。
     */
    unpackSkipImages?: number;
}

/**
 * 像素解包打包时参数。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
 */
export interface IGLTexturePixelStore
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
