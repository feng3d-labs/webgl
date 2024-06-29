/**
 * 渲染参数
 */
export interface RenderParams
{
    /**
     * 是否开启模板测试与更新模板缓冲。
     *
     * Activates stencil testing and updates to the stencil buffer.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    useStencil?: boolean;

    /**
     * 描述模板测试的方法。默认ALWAYS，总是通过。
     *
     * A GLenum specifying the test function. The default function is gl.ALWAYS.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    stencilFunc?: StencilFunc;

    /**
     * 一个为模板测试指定参考值。这个值被限制在0到2^n -1的范围内，其中n是模板缓冲区中的位数。默认0。
     *
     * A GLint specifying the reference value for the stencil test. This value is clamped to the range 0 to 2^n -1 where n is the number of bitplanes in the stencil buffer. The default value is 0.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    stencilFuncRef?: number;

    /**
     * 模板测试时使用的mask值，默认1。
     *
     * A GLuint specifying a bit-wise mask that is used to AND the reference value and the stored stencil value when the test is done. The default value is all 1.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    stencilFuncMask?: number;

    /**
     * 指定模板测试失败时使用的函数的枚举。默认KEEP，保持当前值。
     *
     * A GLenum specifying the function to use when the stencil test fails. The default value is gl.KEEP.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
     */
    stencilOpFail?: StencilOp;

    /**
     * 指定在模板测试通过但深度测试失败时使用的函数枚举。默认KEEP，保持当前值。
     *
     * A GLenum specifying the function to use when the stencil test passes, but the depth test fails. The default value is gl.KEEP.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
     */
    stencilOpZFail?: StencilOp;

    /**
     * 指定在模板测试和深度测试通过时使用的函数枚举，或在模板测试通过且没有深度缓冲或禁用深度测试时使用的函数枚举。默认KEEP，保持当前值。
     *
     * A GLenum specifying the function to use when both the stencil test and the depth test pass, or when the stencil test passes and there is no depth buffer or depth testing is disabled. The default value is gl.KEEP.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
     */
    stencilOpZPass?: StencilOp;

    /**
     * 指定位掩码以启用或禁用在模板平面中写入单个位的正整数。默认1。
     *
     * A GLuint specifying a bit mask to enable or disable writing of individual bits in the stencil planes. By default, the mask is all 1.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
     */
    stencilMask?: number;
}

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
export type BlendEquation = "FUNC_ADD" | "FUNC_SUBTRACT" | "FUNC_REVERSE_SUBTRACT" | "MIN" | "MAX";

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
export type BlendFactor = "ZERO" | "ONE" | "SRC_COLOR" | "ONE_MINUS_SRC_COLOR" | "DST_COLOR" | "ONE_MINUS_DST_COLOR" | "SRC_ALPHA" | "ONE_MINUS_SRC_ALPHA" | "DST_ALPHA" | "ONE_MINUS_DST_ALPHA" | "SRC_ALPHA_SATURATE";

/**
 * A GLenum specifying the test function. The default function is gl.ALWAYS.
 *
 * * `NEVER` 总是不通过。
 * * `LESS` 如果 (ref & mask) <  (stencil & mask) 则通过。
 * * `EQUAL` 如果 (ref & mask) = (stencil & mask) 则通过。
 * * `LEQUAL` 如果 (ref & mask) <= (stencil & mask) 则通过。
 * * `GREATER` 如果 (ref & mask) > (stencil & mask) 则通过。
 * * `NOTEQUAL` 如果 (ref & mask) != (stencil & mask) 则通过。
 * * `GEQUAL` 如果 (ref & mask) >= (stencil & mask) 则通过。
 * * `ALWAYS` 总是通过。
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
 */
export type StencilFunc = "NEVER" | "LESS" | "EQUAL" | "LEQUAL" | "GREATER" | "NOTEQUAL" | "GEQUAL" | "ALWAYS";

/**
 * The WebGLRenderingContext.stencilOp() method of the WebGL API sets both the front and back-facing stencil test actions.
 *
 * * `KEEP` 保持当前值。
 * * `ZERO` 设置模板缓冲值为0
 * * `REPLACE` 将模板缓冲区的值设置为WebGLRenderingContext.stencilFunc()指定的参考值。
 * * `INCR` 增加当前模板缓冲区的值。最大到可表示的无符号值的最大值。
 * * `INCR_WRAP` 增加当前模板缓冲区的值。当增加最大的可表示无符号值时，将模板缓冲区值包装为零。
 * * `DECR` 递减当前模板缓冲区的值。最小为0。
 * * `DECR_WRAP` 递减当前模板缓冲区的值。当模板缓冲区值减为0时，将模板缓冲区值包装为可表示的最大无符号值。
 * * `INVERT` 按位反转当前模板缓冲区值。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
 */
export type StencilOp = "KEEP" | "ZERO" | "REPLACE" | "INCR" | "INCR_WRAP" | "DECR" | "DECR_WRAP" | "INVERT";
