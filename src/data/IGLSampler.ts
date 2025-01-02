import { ISampler } from "@feng3d/render-api";
import { IGLCompareFunction } from "./IGLDepthStencilState";

export interface IGLSampler extends ISampler
{
    /**
     * 默认 "LINEAR_MIPMAP_LINEAR" 。
     */
    minFilter?: IGLTextureMinFilter;

    /**
     * 默认 "LINEAR"。
     */
    magFilter?: IGLTextureMagFilter;

    /**
     * 用于指定纹理在S轴（即水平方向或U坐标轴）上的环绕方式。
     * 
     * 默认 "REPEAT"。
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/samplerParameter#gl.texture_wrap_s
     */
    wrapS?: IGLTextureWrap;

    /**
     * 用于指定纹理在T轴（即垂直方向或V坐标轴）上的环绕方式。
     * 
     * 默认 "REPEAT"。
     */
    wrapT?: IGLTextureWrap;

    /**
     * 用于指定纹理在R轴（即深度方向或W坐标轴）上的环绕方式。用于3D纹理或者纹理数组。
     * 
     * 默认 "REPEAT"。
     */
    wrapR?: IGLTextureWrap;

    /**
     * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为1。
     * 
     * 默认 1。
     */
    anisotropy?: number;

    /**
     * 采样时使用的最小Lod等级。
     * 
     * 默认 0。
     */
    lodMinClamp?: number;

    /**
     * 采样时使用的最大Lod等级。
     * 
     * 默认 16 。
     */
    lodMaxClamp?: number;

    /**
     * 默认 "NONE"。
     */
    compareMode?: IGLSamplerCompareMode;

    /**
     * 比较函数。
     * 
     * 默认 "LEQUAL"。
     */
    compare?: IGLCompareFunction;
}

export type IGLSamplerCompareMode = "NONE" | "COMPARE_REF_TO_TEXTURE";

/**
 * 纹理放大滤波器
 * Texture magnification filter
 *
 * * `LINEAR`
 * * `NEAREST`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export type IGLTextureMagFilter = "LINEAR" | "NEAREST";

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
export type IGLTextureMinFilter = "LINEAR" | "NEAREST" | "NEAREST_MIPMAP_NEAREST" | "LINEAR_MIPMAP_NEAREST" | "NEAREST_MIPMAP_LINEAR" | "LINEAR_MIPMAP_LINEAR";

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
export type IGLTextureWrap = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT";