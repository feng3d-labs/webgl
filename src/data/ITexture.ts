import { ISampler } from "./ISampler";

/**
 * 纹理
 */
export interface ITexture
{
    /**
     * 纹理绑定点。
     */
    textureTarget?: TextureTarget;

    /**
     * 纹理尺寸。
     */
    size?: ITextureSize;

    /**
     * 纹理图片资源。
     */
    source?: TexImageSource[]

    /**
     * 格式
     */
    format?: TextureFormat;

    /**
     * 数据类型
     */
    type?: TextureDataType;

    /**
     * 是否生成mipmap
     */
    generateMipmap?: boolean;

    /**
     * 对图像进行Y轴反转。默认值为false
     */
    flipY?: boolean;

    /**
     * 将图像RGB颜色值得每一个分量乘以A。默认为false
     */
    premulAlpha?: boolean;

    /**
     * 采样器。
     */
    sampler?: ISampler;
}

export type ITextureSize = [width: number, height?: number, depthOrArrayLayers?: number];

/**
 * A GLenum specifying the binding point (target). Possible values:
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
export type TextureTarget = "TEXTURE_2D" | "TEXTURE_CUBE_MAP" | "TEXTURE_3D" | "TEXTURE_2D_ARRAY";

/**
 * 纹理数据类型
 *
 * A GLenum specifying the data type of the texel data. Possible values:
 * * gl.UNSIGNED_BYTE: 8 bits per channel for gl.RGBA
 * * gl.UNSIGNED_SHORT_5_6_5: 5 red bits, 6 green bits, 5 blue bits.
 * * gl.UNSIGNED_SHORT_4_4_4_4: 4 red bits, 4 green bits, 4 blue bits, 4 alpha bits.
 * * gl.UNSIGNED_SHORT_5_5_5_1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
 *
 * When using the WEBGL_depth_texture extension:
 * * gl.UNSIGNED_SHORT
 * * gl.UNSIGNED_INT
 * * ext.UNSIGNED_INT_24_8_WEBGL (constant provided by the extension)
 *
 * When using the OES_texture_float extension:
 * * gl.FLOAT
 *
 * When using the OES_texture_half_float extension:
 * * ext.HALF_FLOAT_OES (constant provided by the extension)
 *
 * When using a WebGL 2 context, the following values are available additionally:
 * * gl.BYTE
 * * gl.UNSIGNED_SHORT
 * * gl.SHORT
 * * gl.UNSIGNED_INT
 * * gl.INT
 * * gl.HALF_FLOAT
 * * gl.FLOAT
 * * gl.UNSIGNED_INT_2_10_10_10_REV
 * * gl.UNSIGNED_INT_10F_11F_11F_REV
 * * gl.UNSIGNED_INT_5_9_9_9_REV
 * * gl.UNSIGNED_INT_24_8
 * * gl.FLOAT_32_UNSIGNED_INT_24_8_REV (pixels must be null)
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export type TextureDataType = "UNSIGNED_BYTE" | "UNSIGNED_SHORT_5_6_5" | "UNSIGNED_SHORT_4_4_4_4" | "UNSIGNED_SHORT_5_5_5_1" // WebGL1
    | "UNSIGNED_SHORT" | "UNSIGNED_INT" | "UNSIGNED_INT_24_8_WEBGL" // WEBGL_depth_texture
    | "FLOAT" // OES_texture_float
    | "HALF_FLOAT_OES" //  OES_texture_half_float
    | "BYTE" | "UNSIGNED_SHORT" | "SHORT" | "UNSIGNED_INT" | "INT" | "HALF_FLOAT" | "FLOAT" | "UNSIGNED_INT_2_10_10_10_REV" // WebGL2
    | "UNSIGNED_INT_10F_11F_11F_REV" | "UNSIGNED_INT_5_9_9_9_REV" | "UNSIGNED_INT_24_8" | "FLOAT_32_UNSIGNED_INT_24_8_REV" // WebGL2
    ;

/**
 * 纹理颜色格式
 * A GLint specifying the color components in the texture
 *
 * * `ALPHA` Discards the red, green and blue components and reads the alpha component.
 * * `RGB` Discards the alpha components and reads the red, green and blue components.
 * * `RGBA` Red, green, blue and alpha components are read from the color buffer.
 * * `LUMINANCE` Each color component is a luminance component, alpha is 1.0.
 * * `LUMINANCE_ALPHA` Each component is a luminance/alpha component.
 * * `DEPTH_COMPONENT` When using the WEBGL_depth_texture extension:
 * * `DEPTH_STENCIL` When using the WEBGL_depth_texture extension:
 * * `SRGB_EXT` When using the EXT_sRGB extension:
 * * `SRGB_ALPHA_EXT` When using the EXT_sRGB extension:
 * * `R8` using a WebGL 2 context
 * * `R16F` using a WebGL 2 context
 * * `R32F` using a WebGL 2 context
 * * `R8UI` using a WebGL 2 context
 * * `RG8` using a WebGL 2 context
 * * `RG16F` using a WebGL 2 context
 * * `RG32F` using a WebGL 2 context
 * * `RG8UI` using a WebGL 2 context
 * * `RG16UI` using a WebGL 2 context
 * * `RG32UI` using a WebGL 2 context
 * * `RGB8` using a WebGL 2 context
 * * `SRGB8` using a WebGL 2 context
 * * `RGB565` using a WebGL 2 context
 * * `R11F_G11F_B10F` using a WebGL 2 context
 * * `RGB9_E5` using a WebGL 2 context
 * * `RGB16F` using a WebGL 2 context
 * * `RGB32F` using a WebGL 2 context
 * * `RGB8UI` using a WebGL 2 context
 * * `RGBA8` using a WebGL 2 context
 * * `RGB5_A1` using a WebGL 2 context
 * * `RGB10_A2` using a WebGL 2 context
 * * `RGBA4` using a WebGL 2 context
 * * `RGBA16F` using a WebGL 2 context
 * * `RGBA32F` using a WebGL 2 context
 * * `RGBA8UI` using a WebGL 2 context
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export type TextureFormat = "ALPHA" | "RGB" | `RGBA` | `LUMINANCE` | `LUMINANCE_ALPHA` | `DEPTH_COMPONENT`
    | `DEPTH_STENCIL` | `SRGB_EXT` | `SRGB_ALPHA_EXT` | `R8` | `R16F` | `R32F`
    | `R8UI` | `RG8` | `RG16F` | `RG32F` | `RG8UI` | `RG16UI`
    | `RG32UI` | `RGB8` | `SRGB8` | `RGB565`
    | `R11F_G11F_B10F` | `RGB9_E5` | `RGB16F` | `RGB32F`
    | `RGB8UI` | `RGBA8` | `RGB5_A1` | `RGB10_A2`
    | `RGBA4` | `RGBA16F` | `RGBA32F` | `RGBA8UI`;
