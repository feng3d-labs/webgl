/**
 * WebGL渲染缓冲区。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/renderbufferStorageMultisample
 */
export interface Renderbuffer
{
    /**
     * WebGL渲染缓冲区内部格式。
     */
    readonly internalformat: RenderbufferInternalformat,

    /**
     * 宽度。
     */
    readonly width: number,

    /**
     * 高度。
     */
    readonly height: number
}

/**
 * WebGL渲染缓冲区内部格式。
 * 
 * A GLenum specifying the internal format of the renderbuffer. Possible values:
 *
 * * gl.RGBA4: 4 red bits, 4 green bits, 4 blue bits 4 alpha bits.
 * * gl.RGB565: 5 red bits, 6 green bits, 5 blue bits.
 * * gl.RGB5_A1: 5 red bits, 5 green bits, 5 blue bits, 1 alpha bit.
 * * gl.DEPTH_COMPONENT16: 16 depth bits.
 * * gl.STENCIL_INDEX8: 8 stencil bits.
 * * gl.DEPTH_STENCIL
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.R8
 * * gl.R8UI
 * * gl.R8I
 * * gl.R16UI
 * * gl.R16I
 * * gl.R32UI
 * * gl.R32I
 * * gl.RG8
 * * gl.RG8UI
 * * gl.RG8I
 * * gl.RG16UI
 * * gl.RG16I
 * * gl.RG32UI
 * * gl.RG32I
 * * gl.RGB8
 * * gl.RGBA8
 * * gl.SRGB8_ALPHA8 (also available as an extension for WebGL 1, see below)
 * * gl.RGB10_A2
 * * gl.RGBA8UI
 * * gl.RGBA8I
 * * gl.RGB10_A2UI
 * * gl.RGBA16UI
 * * gl.RGBA16I
 * * gl.RGBA32I
 * * gl.RGBA32UI
 * * gl.DEPTH_COMPONENT24
 * * gl.DEPTH_COMPONENT32F
 * * gl.DEPTH24_STENCIL8
 * * gl.DEPTH32F_STENCIL8
 *
 * When using the WEBGL_color_buffer_float extension:
 *
 * * ext.RGBA32F_EXT: RGBA 32-bit floating-point type.
 * * ext.RGB32F_EXT: RGB 32-bit floating-point type.
 *
 * When using the EXT_sRGB extension:
 *
 * * ext.SRGB8_ALPHA8_EXT: 8-bit sRGB and alpha.
 *
 * When using a WebGL 2 context and the EXT_color_buffer_float extension:
 *
 * * gl.R16F
 * * gl.RG16F
 * * gl.RGBA16F
 * * gl.R32F
 * * gl.RG32F
 * * gl.RGBA32F
 * * gl.R11F_G11F_B10F
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 */
export type RenderbufferInternalformat = "RGBA4" | "RGB565" | "RGB5_A1" | "DEPTH_COMPONENT16" | "STENCIL_INDEX8" | "DEPTH_STENCIL" // WebGL1
    | "R8" | "R8UI" | "R8I" | "R16UI" | "R16I" | "R32UI" | "R32I" | "RG8" | "RG8UI" | "RG8I" // WebGL2
    | "RG16UI" | "RG16I" | "RG32UI" | "RG32I" | "RGB8" | "RGBA8" | "SRGB8_ALPHA8" | "RGB10_A2" // WebGL2
    | "RGBA8UI" | "RGBA8I" | "RGB10_A2UI" | "RGBA16UI" | "RGBA16I" | "RGBA32I" | "RGBA32UI" // WebGL2
    | "DEPTH_COMPONENT24" | "DEPTH_COMPONENT32F" | "DEPTH24_STENCIL8" | "DEPTH32F_STENCIL8" // WebGL2
    | "RGBA32F_EXT" | "RGB32F_EXT" // WEBGL_color_buffer_float extension
    | "SRGB8_ALPHA8_EXT" // EXT_sRGB extension
    | "R16F" | "RG16F" | "RGBA16F" | "R32F" | "RG32F" | "RGBA32F" | "R11F_G11F_B10F" //  WebGL 2 EXT_color_buffer_float
    ;
