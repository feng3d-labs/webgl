import { BlendEquation, BlendFactor } from "./RenderParams";

/**
 * 为颜色或alpha通道定义相应渲染目标的混合行为。
 */
export interface IBlendComponent
{
    /**
     * 混合方式，默认 FUNC_ADD，源 + 目标。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
     */
    operation?: BlendEquation;

    /**
     * 源混合因子，默认 SRC_ALPHA，将所有颜色乘以源alpha值。
     *
     * @see BlendFactor
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     */
    srcFactor?: BlendFactor;

    /**
     * 目标混合因子，默认 ONE_MINUS_SRC_ALPHA，将所有颜色乘以1减去源alpha值。
     *
     * @see BlendFactor
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
     */
    dstFactor?: BlendFactor;
}