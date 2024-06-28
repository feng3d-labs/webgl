import { LazyObject } from "../types";
import { AttributeBuffer } from "./AttributeBuffer";
import { IDrawVertex } from "./IDrawVertex";
import { ElementBuffer } from "./ElementBuffer";
import { IDrawIndexed } from "./IDrawIndexed";
import { RenderParams } from "./RenderParams";
import { IWebGLRenderPipeline } from "./IWebGLRenderPipeline";
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
    uniforms: LazyObject<Uniforms>;

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
     */
    drawIndexed?: IDrawIndexed;
}
