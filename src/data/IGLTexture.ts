import { ITexture } from "@feng3d/render-api";
import { IGLCanvasTexture } from "./IGLCanvasTexture";

/**
 * 类似纹理，包含画布纹理以及正常纹理。
 */
export type IGLTextureLike = IGLCanvasTexture | ITexture;

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
