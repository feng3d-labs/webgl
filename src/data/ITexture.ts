/**
 * 纹理视图。
 */
export interface ITextureView
{
    /**
     * 纹理。
     */
    texture: ITexture,

    /**
     * mipmap级别。
     */
    level: number;

    /**
     * 纹理数组中的层次。
     */
    layer?: number;
}

/**
 * 纹理
 */
export interface ITexture
{
    /**
     * 纹理绑定点。
     *
     * 默认"TEXTURE_2D"。
     */
    target?: ITextureTarget;

    /**
     * 纹理资源。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    sources?: ITextureSource[];

    /**
     * 初始纹理时指定纹理存储的各个级别。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage2D
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage3D
     */
    storage?: ITextureStorage;

    /**
     * 写入纹理。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
     */
    writeTextures?: IWriteTexture[];

    /**
     * 是否生成mipmap
     */
    generateMipmap?: boolean;

    /**
     * 像素解包打包时参数。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    pixelStore?: ITexturePixelStore;

    /**
     * 内部纹理格式。
     *
     * 默认 "RGBA"。
     */
    internalformat?: ITextureInternalFormat,

    /**
     * 纹理格式。
     *
     * 默认 "RGBA"。
     */
    format?: ITextureFormat;

    /**
     * 数据类型。
     *
     * 默认 "UNSIGNED_BYTE"。
     */
    type?: ITextureDataType;
}

/**
 * 纹理资源。
 */
export type ITextureSource = IImageSource | IBufferSource;

/**
 * 纹理图片资源。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texImage3D
 */
export interface IImageSource
{
    /**
     * 当上传CubeMap纹理数据时指定位置。
     */
    cubeTarget?: TextureCubeMapTarget;

    /**
     * mipmap级别。
     *
     * 默认为 0。
     */
    level?: number,

    /**
     * 纹理图片资源。
     */
    source: TexImageSource
}

/**
 * 纹理数据资源。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export interface IBufferSource
{
    /**
     * 当上传CubeMap纹理数据时指定位置。
     */
    cubeTarget?: TextureCubeMapTarget;

    /**
     * mipmap级别
     *
     * 默认为 0。
     */
    level?: number,

    /**
     * 纹理宽度。
     *
     * 默认为 1。
     */
    width?: number,

    /**
     * 纹理高度。
     *
     * 默认为 1。
     */
    height?: number,

    /**
     * 纹理深度，默认为 1。
     *
     * WebGL2 支持。
     */
    depth?: number;

    /**
     * 默认为 0。
     */
    border?: number,

    /**
     * 像素数据。
     *
     * 默认为 undefined。
     */
    pixels?: ArrayBufferView;
}

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
export type TextureCubeMapTarget =
    | "TEXTURE_CUBE_MAP_POSITIVE_X"
    | "TEXTURE_CUBE_MAP_NEGATIVE_X"
    | "TEXTURE_CUBE_MAP_POSITIVE_Y"
    | "TEXTURE_CUBE_MAP_NEGATIVE_Y"
    | "TEXTURE_CUBE_MAP_POSITIVE_Z"
    | "TEXTURE_CUBE_MAP_NEGATIVE_Z";

/**
 * 写入纹理。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
 */
export interface IWriteTexture
{
    /**
     * 当上传CubeMap纹理数据时指定位置。
     */
    cubeTarget?: TextureCubeMapTarget;
    /**
     * mipmap级别。
     */
    level: number,
    /**
     * 写入x轴偏移。
     */
    xoffset: number,
    /**
     * 写入Y轴偏移。
     */
    yoffset: number,
    /**
     * 写入3D纹理时深度偏移。
     */
    zoffset?: number;
    /**
     * 写入宽度。
     */
    width?: number,
    /**
     * 写入高度。
     */
    height?: number,
    /**
     * 写入3D纹理深度。
     */
    depth?: number,
    /**
     * 纹理图源数据。
     */
    source?: TexImageSource
    /**
     * 写入像素数据。
     */
    srcData?: ArrayBufferView,
    /**
     * 写入像素数据偏移。
     */
    srcOffset?: number
}

/**
 * 初始纹理时指定纹理存储的各个级别。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texStorage2D
 */
export interface ITextureStorage
{
    levels: number, width: number, height: number;
    /**
     * 3D纹理深度。
     */
    depth?: number
}

/**
 * 像素解包打包时参数。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
 */
export interface ITexturePixelStore
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

/**
 * 纹理绑定点。
 *
 * * gl.TEXTURE_2D: A two-dimensional texture.
 * * gl.TEXTURE_CUBE_MAP: A cube-mapped texture.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.TEXTURE_3D: A three-dimensional texture.
 * * gl.TEXTURE_2D_ARRAY: A two-dimensional array texture.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture
 */
export type ITextureTarget = "TEXTURE_2D" | "TEXTURE_CUBE_MAP" | "TEXTURE_3D" | "TEXTURE_2D_ARRAY";

/**
 * internalformat	format	type
 *
 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
 */
export type ITextureTypes =
    | { internalformat: "RGB", format: "RGB", type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT_5_6_5" }
    | { internalformat: "RGBA", format: "RGBA", type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT_4_4_4_4" | "UNSIGNED_SHORT_5_5_5_1" }
    | { internalformat: "LUMINANCE_ALPHA", format: "LUMINANCE_ALPHA", type: "UNSIGNED_BYTE" }
    | { internalformat: "LUMINANCE", format: "LUMINANCE", type: "UNSIGNED_BYTE" }
    | { internalformat: "ALPHA", format: "ALPHA", type: "UNSIGNED_BYTE" }
    | { internalformat: "R8", format: "RED", type: "UNSIGNED_BYTE" }
    | { internalformat: "R16F", format: "RED", type: "HALF_FLOAT" | " FLOAT" }
    | { internalformat: "R32F", format: "RED", type: "FLOAT" }
    | { internalformat: "R8UI", format: "RED_INTEGER", type: "UNSIGNED_BYTE" }
    | { internalformat: "RG8", format: "RG", type: "UNSIGNED_BYTE" }
    | { internalformat: "RG16F", format: "RG", type: "HALF_FLOAT" | "FLOAT" }
    | { internalformat: "RG32F", format: "RG", type: "FLOAT" }
    | { internalformat: "RG8UI", format: "RG_INTEGER", type: "UNSIGNED_BYTE" }
    | { internalformat: "RGB8", format: "RGB", type: "UNSIGNED_BYTE" }
    | { internalformat: "SRGB8", format: "RGB", type: "UNSIGNED_BYTE" }
    | { internalformat: "RGB565", format: "RGB", type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT_5_6_5" }
    | { internalformat: "R11F_G11F_B10F", format: "RGB", type: "UNSIGNED_INT_10F_11F_11F_REV" | "HALF_FLOAT" | "FLOAT" }
    | { internalformat: "RGB9_E5", format: "RGB", type: "HALF_FLOAT" | "FLOAT" }
    | { internalformat: "RGB16F", format: "RGB", type: "HALF_FLOAT" | "FLOAT" }
    | { internalformat: "RGB32F", format: "RGB", type: "FLOAT" }
    | { internalformat: "RGB8UI", format: "RGB_INTEGER", type: "UNSIGNED_BYTE" }
    | { internalformat: "RGBA8", format: "RGBA", type: "UNSIGNED_BYTE" }
    | { internalformat: "SRGB8_ALPHA8", format: "RGBA", type: "UNSIGNED_BYTE" }
    | { internalformat: "RGB5_A1", format: "RGBA", type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT_5_5_5_1" }
    | { internalformat: "RGB10_A2", format: "RGBA", type: "UNSIGNED_INT_2_10_10_10_REV" }
    | { internalformat: "RGBA4", format: "RGBA", type: "UNSIGNED_BYTE" | "UNSIGNED_SHORT_4_4_4_4" }
    | { internalformat: "RGBA16F", format: "RGBA", type: "HALF_FLOAT" | "FLOAT" }
    | { internalformat: "RGBA32F", format: "RGBA", type: "FLOAT" }
    | { internalformat: "RGBA8UI", format: "RGBA_INTEGER", type: "UNSIGNED_BYTE" }
    // 深度纹理
    | { internalformat: "DEPTH_COMPONENT16", format: "DEPTH_COMPONENT", type: "UNSIGNED_SHORT", }
    ;

export type ITextureInternalFormat = ITextureTypes["internalformat"];
export type ITextureFormat = ITextureTypes["format"];
export type ITextureDataType = ITextureTypes["type"];
