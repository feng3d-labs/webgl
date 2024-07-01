import { LazyObject } from "../types";
import { IDrawIndexed } from "./IDrawIndexed";
import { IDrawVertex } from "./IDrawVertex";
import { IRenderPipeline } from "./IRenderPipeline";
import { IScissor } from "./IScissor";
import { IUniforms } from "./IUniforms";
import { IVertexArrayObject } from "./IVertexArrayObject";
import { IViewport } from "./IViewport";

/**
 * 渲染原子（该对象会收集一切渲染所需数据以及参数）
 */
export interface IRenderObject
{
    /**
     * 渲染程序
     */
    pipeline: IRenderPipeline;

    /**
     * 顶点属性以及索引数据。
     */
    vertexArray: IVertexArrayObject;

    /**
     * Uniform渲染数据
     */
    uniforms?: LazyObject<IUniforms>;

    /**
     * 绘制一定数量顶点。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
     */
    drawVertex?: IDrawVertex;

    /**
     * 绘制一定数量顶点索引。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
     */
    drawIndexed?: IDrawIndexed;

    /**
     * 视窗，显示在画布上的区域。
     *
     * 指定了x和y从标准化设备坐标到窗口坐标的仿射变换。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport
     */
    viewport?: IViewport;

    /**
     * 剪刀盒。
     *
     * 设置了一个剪刀盒，它将绘图限制为一个指定的矩形。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor
     */
    scissor?: IScissor;
}
