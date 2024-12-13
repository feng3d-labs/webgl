import { IRenderPipeline } from "@feng3d/render-api";
import { IGLDepthStencilState } from "./IGLDepthStencilState";

declare module "@feng3d/render-api"
{
    /**
     * 渲染管线。
     */
    export interface IRenderPipeline
    {
        /**
         * 描述可选的深度模板的测试、运算以及偏差。
         */
        depthStencil?: IGLDepthStencilState;

        /**
         * 回写变量。
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/transformFeedbackVaryings
         */
        transformFeedbackVaryings?: ITransformFeedbackVaryings;

        /**
         * 是否丢弃后续光栅化阶段。
         *
         * gl.RASTERIZER_DISCARD
         */
        rasterizerDiscard?: boolean;
    }

    export interface IFragmentState
    {
        /**
         * 定义了该管道写入的颜色目标的格式和行为。
         */
        readonly targets?: readonly IColorTargetState[]
    }

    export interface IColorTargetState
    {
        /**
         * 混合状态。
         */
        readonly blend?: IBlendState;

        /**
         * 控制那些颜色分量是否可以被写入到帧缓冲器。
         *
         * [red: boolean, green: boolean, blue: boolean, alpha: boolean]
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/colorMask
         */
        readonly writeMask?: IGLWriteMask;
    }

    /**
     * 混合状态。
     */
    export interface IBlendState
    {
        /**
         * 为颜色通道定义相应渲染目标的混合行为。
         */
        readonly color?: IBlendComponent;

        /**
         * 为alpha通道定义相应渲染目标的混合行为。
         */
        readonly alpha?: IBlendComponent;
    }

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
        operation?: IGLBlendEquation;

        /**
         * 源混合因子，默认 SRC_ALPHA，将所有颜色乘以源alpha值。
         *
         * @see IGLBlendFactor
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
         */
        srcFactor?: IGLBlendFactor;

        /**
         * 目标混合因子，默认 ONE_MINUS_SRC_ALPHA，将所有颜色乘以1减去源alpha值。
         *
         * @see IGLBlendFactor
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
         */
        dstFactor?: IGLBlendFactor;
    }

}

export interface ITransformFeedbackVaryings
{
    /**
     * 回写变量列表。
    */
    varyings: string[];

    /**
     * 交叉或者分离。
    */
    bufferMode: "INTERLEAVED_ATTRIBS" | "SEPARATE_ATTRIBS";
}

export type IGLWriteMask = [red: boolean, green: boolean, blue: boolean, alpha: boolean];


/**
 * 混合因子（R分量系数，G分量系数，B分量系数）
 *
 * 混合颜色的公式可以这样描述：color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor)。这里的 RGBA 值均在0与1之间。
 *
 * The formula for the blending color can be described like this: color(RGBA) = (sourceColor * sfactor) + (destinationColor * dfactor). The RBGA values are between 0 and 1.
 *
 * * `ZERO` Factor: (0,0,0,0); 把所有颜色都乘以0。
 * * `ONE` Factor: (1,1,1,1); 把所有颜色都乘以1。
 * * `SRC_COLOR` Factor: (Rs, Gs, Bs, As); 将所有颜色乘以源颜色。
 * * `ONE_MINUS_SRC_COLOR` Factor: (1-Rs, 1-Gs, 1-Bs, 1-As); 将所有颜色乘以1减去每个源颜色。
 * * `DST_COLOR` Factor: (Rd, Gd, Bd, Ad); 将所有颜色乘以目标颜色。
 * * `ONE_MINUS_DST_COLOR` Factor: (1-Rd, 1-Gd, 1-Bd, 1-Ad); 将所有颜色乘以1减去每个目标颜色。
 * * `SRC_ALPHA` Factor: (As, As, As, As); 将所有颜色乘以源alpha值。
 * * `ONE_MINUS_SRC_ALPHA` Factor: (1-As, 1-As, 1-As, 1-As); 将所有颜色乘以1减去源alpha值。
 * * `DST_ALPHA` Factor: (Ad, Ad, Ad, Ad); 将所有颜色乘以目标alpha值。
 * * `ONE_MINUS_DST_ALPHA` Factor: (1-Ad, 1-Ad, 1-Ad, 1-Ad); 将所有颜色乘以1减去目标alpha值。
 * * `CONSTANT_COLOR` Factor: (Rc, Gc, Bc, Ac); 将所有颜色乘以一个常数颜色。
 * * `ONE_MINUS_CONSTANT_COLOR` Factor: (1-Rc, 1-Gc, 1-Bc, 1-Ac); 所有颜色乘以1减去一个常数颜色。
 * * `CONSTANT_ALPHA` Factor: (Ac, Ac, Ac, Ac); 将所有颜色乘以一个常量alpha值。
 * * `ONE_MINUS_CONSTANT_ALPHA` Factor: (1-Ac, 1-Ac, 1-Ac, 1-Ac); 将所有颜色乘以1减去一个常数alpha值。
 * * `SRC_ALPHA_SATURATE` Factor: (min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad), 1); 将RGB颜色乘以源alpha值与1减去目标alpha值的较小值。alpha值乘以1。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendFunc
 */
export type IGLBlendFactor = "ZERO" | "ONE" | "SRC_COLOR" | "ONE_MINUS_SRC_COLOR" | "DST_COLOR" | "ONE_MINUS_DST_COLOR" | "SRC_ALPHA" | "ONE_MINUS_SRC_ALPHA" | "DST_ALPHA" | "ONE_MINUS_DST_ALPHA" | "SRC_ALPHA_SATURATE" | "CONSTANT_COLOR" | "ONE_MINUS_CONSTANT_COLOR" | "CONSTANT_ALPHA" | "ONE_MINUS_CONSTANT_ALPHA";

/**
 * 混合方法
 *
 * * FUNC_ADD 源 + 目标
 * * FUNC_SUBTRACT 源 - 目标
 * * FUNC_REVERSE_SUBTRACT 目标 - 源
 * * MIN 源与目标的最小值，在 WebGL 2 中可使用。在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MIN_EXT 值。
 * * MAX 源与目标的最大值，在 WebGL 2 中可使用。在 WebGL 1 时，自动使用 EXT_blend_minmax 扩展中 MAX_EXT 值。
 *
 * A GLenum specifying how source and destination colors are combined. Must be either:
 *
 * * gl.FUNC_ADD: source + destination (default value)
 * * gl.FUNC_SUBTRACT: source - destination
 * * gl.FUNC_REVERSE_SUBTRACT: destination - source
 *
 * When using the EXT_blend_minmax extension:
 *
 * * ext.MIN_EXT: Minimum of source and destination
 * * ext.MAX_EXT: Maximum of source and destination
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.MIN: Minimum of source and destination
 * * gl.MAX: Maximum of source and destination
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 */
export type IGLBlendEquation = "FUNC_ADD" | "FUNC_SUBTRACT" | "FUNC_REVERSE_SUBTRACT" | "MIN" | "MAX";
