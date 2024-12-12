/**
 * 深度模板状态。
 */
export interface IGLDepthStencilState
{
    /**
     * 深度状态。
     */
    depth?: IGLDepthState;

    /**
     * 模板状态。
     */
    stencil?: IGLStencilState;
}

/**
 * 深度状态。
 */
export interface IGLDepthState
{
    /**
     * 是否开启深度检查，默认 true，开启深度检测。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    depthtest?: boolean;

    /**
     * 是否写入深度。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthMask
     */
    depthWriteEnabled?: boolean;

    /**
     * 指定深度比较函数的枚举，该函数设置绘制像素的条件。
     *
     * 默认 LESS，如果传入值小于深度缓冲区值则通过。
     *
     * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
     *
     * @see IGLCompareFunction
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    depthCompare?: IGLCompareFunction;

    /**
     * 深度偏移。
     *
     * 用于在深度测试中提供偏移量，以避免Z-fighting和其他深度相关的渲染问题。
     */
    depthBias?: IDepthBias;
}

/**
 * 深度偏移。
 *
 * 用于在深度测试中提供偏移量，以避免Z-fighting和其他深度相关的渲染问题。
 */
export interface IDepthBias
{
    /**
     * 它设置特定于实现的值乘以的乘数，以创建恒定的深度偏移量。缺省值为0。
     *
     * 对应WebGPU中的 GPUDepthStencilState.depthBias 。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
     */
    units: number;

    /**
     * 为每个多边形设置可变深度偏移的比例因子。缺省值为0。
     *
     * 对应WebGPU中的 GPUDepthStencilState.depthBiasSlopeScale 。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
     */
    factor: number;
}

/**
 * 模板状态。
 */
export interface IGLStencilState
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
     * 模板正面状态。
     */
    stencilFront?: IStencilFaceState;

    /**
     * 模板正面状态。
     */
    stencilBack?: IStencilFaceState;
}

/**
 * 模板单面状态。定义如何比较与运算模板值。
 */
export interface IStencilFaceState
{
    /**
     * 描述模板测试的方法。默认ALWAYS，总是通过。
     *
     * A GLenum specifying the test function. The default function is gl.ALWAYS.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    stencilFunc?: IGLStencilFunc;

    /**
     * 一个为模板测试指定参考值。这个值被限制在0到2^n -1的范围内，其中n是模板缓冲区中的位数。默认0。
     *
     * A GLint specifying the reference value for the stencil test. This value is clamped to the range 0 to 2^n -1 where n is the number of bitplanes in the stencil buffer. The default value is 0.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    stencilFuncRef?: number;

    /**
     * 模板测试时使用的mask值，默认全为1（0b11111111）。
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
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
     */
    stencilOpFail?: IGLStencilOp;

    /**
     * 指定在模板测试通过但深度测试失败时使用的函数枚举。默认KEEP，保持当前值。
     *
     * A GLenum specifying the function to use when the stencil test passes, but the depth test fails. The default value is gl.KEEP.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
     */
    stencilOpZFail?: IGLStencilOp;

    /**
     * 指定在模板测试和深度测试通过时使用的函数枚举，或在模板测试通过且没有深度缓冲或禁用深度测试时使用的函数枚举。默认KEEP，保持当前值。
     *
     * A GLenum specifying the function to use when both the stencil test and the depth test pass, or when the stencil test passes and there is no depth buffer or depth testing is disabled. The default value is gl.KEEP.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
     */
    stencilOpZPass?: IGLStencilOp;

    /**
     * 指定位掩码以启用或禁用在模板平面中写入单个位的正整数。默认全为1（0b11111111）。
     *
     * A GLuint specifying a bit mask to enable or disable writing of individual bits in the stencil planes. By default, the mask is all 1.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
     */
    stencilMask?: number;
}

/**
 * 指定深度比较函数的枚举，该函数设置绘制像素的条件，默认 LESS，如果传入值小于深度缓冲区值则通过。
 *
 * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
 *
 * * `NEVER` 总是不通过。
 * * `LESS` 如果传入值小于深度缓冲区值则通过。
 * * `EQUAL` 如果传入值等于深度缓冲区值则通过。
 * * `LEQUAL` 如果传入值小于或等于深度缓冲区值则通过。
 * * `GREATER` 如果传入值大于深度缓冲区值则通过。
 * * `NOTEQUAL` 如果传入值不等于深度缓冲区值则通过。
 * * `GEQUAL` 如果传入值大于或等于深度缓冲区值则通过。
 * * `ALWAYS` 总是通过。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 */
export type IGLCompareFunction = "NEVER" | "LESS" | "EQUAL" | "LEQUAL" | "GREATER" | "NOTEQUAL" | "GEQUAL" | "ALWAYS";

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
export type IGLStencilFunc = "NEVER" | "LESS" | "EQUAL" | "LEQUAL" | "GREATER" | "NOTEQUAL" | "GEQUAL" | "ALWAYS";

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
export type IGLStencilOp = "KEEP" | "ZERO" | "REPLACE" | "INCR" | "INCR_WRAP" | "DECR" | "DECR_WRAP" | "INVERT";
