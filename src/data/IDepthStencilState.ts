export interface IDepthStencilState
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
     * @see DepthFunc
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
     */
    depthCompare?: DepthFunc;

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
export type DepthFunc = "NEVER" | "LESS" | "EQUAL" | "LEQUAL" | "GREATER" | "NOTEQUAL" | "GEQUAL" | "ALWAYS";
