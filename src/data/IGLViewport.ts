/**
 * 视窗。
 */
export interface IGLViewport
{
    /**
     * 数据类型。
     */
    readonly __type: "Viewport";

    /**
     * 视窗X轴最小值（像素）。
     */
    x: number,

    /**
     * 视窗Y轴最小值（像素）。
     */
    y: number,

    /**
     * 视窗宽度（像素）。
     */
    width: number,

    /**
     * 视窗高度（像素）。
     */
    height: number,
}
