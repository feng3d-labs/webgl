import { ITexture, ITextureImageSource } from "@feng3d/render-api";
import { IGLCanvasTexture } from "./IGLCanvasTexture";
import { IGLTexturePixelStore, IGLTexturePixelStore1 } from "./IGLTexturePixelStore";

/**
 * 类似纹理，包含画布纹理以及正常纹理。
 */
export type IGLTextureLike = IGLCanvasTexture | IGLTexture;

/**
 * 纹理
 */
export interface IGLTexture extends ITexture
{
    /**
     * 纹理资源。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage3D
     */
    sources?: readonly IGLTextureSource[];
}

/**
 * 纹理资源。
 */
export type IGLTextureSource = IGLTextureImageSource | IGLTextureBufferSource;

/**
 * 纹理图片资源。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texSubImage3D
 * 
 * 注：不再支持参数 `border`
 */
export interface IGLTextureImageSource extends ITextureImageSource
{
    /**
     * 像素解包打包时参数。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    readonly pixelStore?: IGLTexturePixelStore1;

    /**
     * 写入mipmap级别。
     *
     * 默认为 0。
     */
    level?: number,

    /**
     * 写入x轴偏移。
     * 
     * 默认为0。
     */
    xoffset?: number,

    /**
     * 写入Y轴偏移。
     * 
     * 默认为0。
     */
    yoffset?: number,

    /**
     * 写入3D纹理时深度偏移。
     * 
     * 默认为0。
     */
    zoffset?: number;

    /**
     * 写入宽度。
     * 
     * 默认取图片宽度。
     *
     * WebGL2支持
     */
    width?: number;

    /**
     * 写入高度。
     * 
     * 默认取图片高度。
     *
     * WebGL2支持
     */
    height?: number;

    /**
     * 写入纹理深度尺寸，默认为 1。
     *
     * WebGL2 支持。
     */
    depthOrArrayLayers?: number;
}

/**
 * 纹理数据资源。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texSubImage3D
 */
export interface IGLTextureBufferSource
{
    /**
     * 像素解包打包时参数。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    readonly pixelStore?: IGLTexturePixelStore;

    /**
     * 写入mipmap级别。
     *
     * 默认为 0。
     */
    level?: number,

    /**
     * 写入x轴偏移。
     * 
     * 默认为0。
     */
    xoffset?: number,

    /**
     * 写入Y轴偏移。
     * 
     * 默认为0。
     */
    yoffset?: number,

    /**
     * 写入3D纹理时深度偏移。
     * 
     * 默认为0。
     */
    zoffset?: number;

    /**
     * 写入纹理宽度。
     */
    width: number,

    /**
     * 写入纹理高度。
     */
    height: number,

    /**
     * 写入纹理深度尺寸，默认为 1。
     *
     * WebGL2 支持。
     */
    depthOrArrayLayers?: number;

    /**
     * 像素数据。
     */
    pixels: ArrayBufferView;

    /**
     * 默认为 0。
     */
    pixelsOffset?: number;
}

/**
 * 写入纹理。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texSubImage3D
 */
export type IGLWriteTexture = IGLTextureImageSource | IGLTextureBufferSource;

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
export type IGLTextureTarget = "TEXTURE_2D" | "TEXTURE_CUBE_MAP" | "TEXTURE_3D" | "TEXTURE_2D_ARRAY";

/**
 * internalformat	format	type
 *
 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
 */
export type IGLTextureTypes =
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

export type IGLTextureInternalFormat = IGLTextureTypes["internalformat"];
export type IGLTextureFormat = IGLTextureTypes["format"];
export type IGLTextureDataType = IGLTextureTypes["type"];
