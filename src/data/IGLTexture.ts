import { ITexture } from "@feng3d/render-api";
import { IGLCanvasTexture } from "./IGLCanvasTexture";
import { IGLTexturePixelStore } from "./IGLTexturePixelStore";

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
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
     */
    sources?: IGLTextureSource[];

    /**
     * 写入纹理。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texSubImage2D
     */
    writeTextures?: IGLWriteTexture[];

    /**
     * 是否生成mipmap
     */
    readonly generateMipmap?: boolean;

    /**
     * 像素解包打包时参数。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    readonly pixelStore?: IGLTexturePixelStore;
}

/**
 * 纹理资源。
 */
export type IGLTextureSource = IGLImageSource | IGLBufferSource;

/**
 * 纹理图片资源。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/texImage3D
 * 
 * 注：不再支持参数 `border`
 */
export interface IGLImageSource
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

    /**
     * WebGL2支持
     */
    width?: number;

    /**
     * WebGL2支持
     */
    height?: number;

    /**
     * 纹理深度，默认为 0。
     *
     * WebGL2 支持。
     */
    depthOrArrayLayers?: number;
}

/**
 * 纹理数据资源。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export interface IGLBufferSource
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
     */
    width: number,

    /**
     * 纹理高度。
     */
    height: number,

    /**
     * 纹理深度，默认为 1。
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
export interface IGLWriteTexture
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
    depthOrArrayLayers?: number,
    /**
     * 纹理图源数据。
     */
    source?: TexImageSource
    /**
     * 写入像素数据。
     */
    pixels?: ArrayBufferView,
    /**
     * 写入像素数据偏移。
     */
    pixelsOffset?: number
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
export type GLTextureTarget = "TEXTURE_2D" | "TEXTURE_CUBE_MAP" | "TEXTURE_3D" | "TEXTURE_2D_ARRAY";

/**
 * internalformat	format	type
 *
 * @see https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
 */
export type GLTextureTypes =
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

export type IGLTextureInternalFormat = GLTextureTypes["internalformat"];
export type IGLTextureFormat = GLTextureTypes["format"];
export type IGLTextureDataType = GLTextureTypes["type"];
