import { LazyObject } from "../types";
import { AttributeBuffer } from "./AttributeBuffer";
import { DrawCall } from "./DrawCall";
import { ElementBuffer } from "./ElementBuffer";
import { IWebGLDrawIndexed } from "./IWebGLDrawIndexed";
import { RenderParams } from "./RenderParams";
import { Shader } from "./Shader";
import { Uniforms } from "./Uniforms";

/**
 * 渲染原子（该对象会收集一切渲染所需数据以及参数）
 */
export interface RenderAtomic
{
    /**
     * 渲染程序
     */
    pipeline: Shader;

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
    drawCall?: DrawCall;

    /**
     * 绘制一定数量顶点索引。
     */
    drawIndexed?: IWebGLDrawIndexed;
}
