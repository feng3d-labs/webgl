import { LazyObject } from "../types";
import { AttributeBuffer } from "./AttributeBuffer";
import { ElementBuffer } from "./ElementBuffer";
import { IDrawIndexed } from "./IDrawIndexed";
import { IDrawVertex } from "./IDrawVertex";
import { IViewport } from "./IViewport";
import { IWebGLRenderPipeline } from "./IWebGLRenderPipeline";
import { RenderParams } from "./RenderParams";
import { Uniforms } from "./Uniforms";

/**
 * 渲染原子（该对象会收集一切渲染所需数据以及参数）
 */
export interface IRenderObject
{
    /**
     * 渲染程序
     */
    pipeline: IWebGLRenderPipeline;

    /**
     * 顶点索引缓冲
     */
    index?: ElementBuffer;

    /**
     * 属性数据列表
     */
    attributes: { [key: string]: AttributeBuffer; };

    /**
     * Uniform渲染数据
     */
    uniforms?: LazyObject<Uniforms>;

    /**
     * 渲染参数
    */
    renderParams?: RenderParams;

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
     * 视窗。
     *
     * 通过WebGL API的WebGLRenderingContext.viewport()方法设置了viewport，指定了x和y从标准化设备坐标到窗口坐标的仿射变换。
     *
     * The WebGLRenderingContext.viewport() method of the WebGL API sets the viewport, which specifies the affine transformation of x and y from normalized device coordinates to window coordinates.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport
     */
    viewport?: IViewport;
}
