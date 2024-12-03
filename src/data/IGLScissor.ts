/**
 * 剪刀盒。
 *
 * 设置了一个剪刀盒，它将绘图限制为一个指定的矩形。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor
 */
export interface IGLScissor
{
    /**
     * 是否开启
     */
    enable?: boolean;

    /**
     * 剪刀盒X轴最小值（像素）。
     */
    x: number,

    /**
     * 剪刀盒Y轴最小值（像素）。
     */
    y: number,

    /**
     * 剪刀盒宽度（像素）。
     */
    width: number,

    /**
     * 剪刀盒高度（像素）。
     */
    height: number,
}