import { watcher } from "@feng3d/watcher";

/**
 * 纹理
 */
export abstract class Texture
{
    name: string;

    /**
     * 纹理类型
     */
    textureTarget: TextureTarget;

    /**
     * 格式
     */
    format: TextureFormat = "RGBA";

    /**
     * 数据类型
     */
    type: TextureDataType = "UNSIGNED_BYTE";

    /**
     * 是否生成mipmap
     */
    generateMipmap = true;

    /**
     * 对图像进行Y轴反转。默认值为false
     */
    flipY = false;

    /**
     * 将图像RGB颜色值得每一个分量乘以A。默认为false
     */
    premulAlpha = false;

    minFilter: TextureMinFilter = "LINEAR_MIPMAP_LINEAR";

    magFilter: TextureMagFilter = "LINEAR";

    /**
     * 表示x轴的纹理的回环方式，就是当纹理的宽度小于需要贴图的平面的宽度的时候，平面剩下的部分应该p以何种方式贴图的问题。
     */
    wrapS: TextureWrap = "REPEAT";

    /**
     * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式。
     */
    wrapT: TextureWrap = "REPEAT";

    /**
     * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为1。
     */
    anisotropy = 1;

    /**
     * 是否失效，值为true时重新创建 WebGLTexture
     */
    version = 0;

    constructor()
    {
        watcher.watch(this as Texture, "format", this.invalidate, this);
        watcher.watch(this as Texture, "type", this.invalidate, this);
        watcher.watch(this as Texture, "generateMipmap", this.invalidate, this);
        watcher.watch(this as Texture, "flipY", this.invalidate, this);
        watcher.watch(this as Texture, "premulAlpha", this.invalidate, this);
    }

    /**
     * 使纹理失效
     */
    invalidate()
    {
        this.version++;
    }

    abstract setTextureData(gl: WebGLRenderingContext): void;

    /**
     * 纹理尺寸。
     */
    abstract getSize(): { x: number, y: number };
}

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

/**
 * 纹理放大滤波器
 * Texture magnification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type TextureMagFilter = "LINEAR" | "NEAREST";

/**
 * 纹理缩小过滤器
 * Texture minification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 * * `NEAREST_MIPMAP_NEAREST`
 * * `LINEAR_MIPMAP_NEAREST`
 * * `NEAREST_MIPMAP_LINEAR`
 * * `LINEAR_MIPMAP_LINEAR`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type TextureMinFilter = "LINEAR" | "NEAREST" | "NEAREST_MIPMAP_NEAREST" | "LINEAR_MIPMAP_NEAREST" | "NEAREST_MIPMAP_LINEAR" | "LINEAR_MIPMAP_LINEAR";

/**
 * 纹理坐标s包装函数枚举
 * Wrapping function for texture coordinate s
 *
 * * `REPEAT`
 * * `CLAMP_TO_EDGE`
 * * `MIRRORED_REPEAT`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type TextureWrap = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT";