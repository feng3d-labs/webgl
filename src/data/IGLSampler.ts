import { GLCompareFunction } from "./IGLDepthStencilState";

export interface IGLSampler
{

    minFilter?: GLTextureMinFilter;

    magFilter?: TextureMagFilter;

    /**
     * 表示x轴的纹理的回环方式，就是当纹理的宽度小于需要贴图的平面的宽度的时候，平面剩下的部分应该p以何种方式贴图的问题。
     */
    wrapS?: GLTextureWrap;

    /**
     * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式。
     */
    wrapT?: GLTextureWrap;

    /**
     * 表示y轴的纹理回环方式。 magFilter和minFilter表示过滤的方式。
     */
    wrapR?: GLTextureWrap;

    /**
     * 各向异性过滤。使用各向异性过滤能够使纹理的效果更好，但是会消耗更多的内存、CPU、GPU时间。默认为1。
     */
    anisotropy?: number;

    /**
     * 采样时使用的最小Lod等级。
     */
    lodMinClamp?: number;

    /**
     * 采样时使用的最大Lod等级。
     */
    lodMaxClamp?: number;

    compareMode?: GLSamplerCompareMode;
    /**
     * 比较函数。
     */
    compare?: GLCompareFunction;
}

export type GLSamplerCompareMode = "NONE" | "COMPARE_REF_TO_TEXTURE";

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
export type GLTextureMinFilter = "LINEAR" | "NEAREST" | "NEAREST_MIPMAP_NEAREST" | "LINEAR_MIPMAP_NEAREST" | "NEAREST_MIPMAP_LINEAR" | "LINEAR_MIPMAP_LINEAR";

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
export type GLTextureWrap = "REPEAT" | "CLAMP_TO_EDGE" | "MIRRORED_REPEAT";