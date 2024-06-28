import { LazyObject } from "../types";
import { AttributeBuffer } from "./AttributeBuffer";
import { DrawCall } from "./DrawCall";
import { ElementBuffer } from "./ElementBuffer";
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

    drawCall?: DrawCall;

    /**
     * 渲染参数
     */
    renderParams?: RenderParams;
}
