import { LazyObject } from "../types";
import { IGLDrawIndexed } from "./IGLDrawIndexed";
import { IGLDrawVertex } from "./IGLDrawVertex";
import { IElementBufferSourceTypes } from "./IGLIndexBuffer";
import { IGLRenderPipeline } from "./IGLRenderPipeline";
import { IGLTransformFeedback } from "./IGLTransformFeedback";
import { IGLUniforms } from "./IGLUniforms";
import { IGLVertexAttributes } from "./IGLVertexAttributes";

/**
 * 渲染原子（该对象会收集一切渲染所需数据以及参数）
 */
export interface IGLRenderObject
{
    /**
     * 数据类型。
     */
    readonly __type?: "RenderObject";

    /**
     * 渲染程序
     */
    pipeline: IGLRenderPipeline;

    /**
     * 顶点属性数据列表
     */
    vertices?: IGLVertexAttributes;

    /**
     * 顶点索引数据
     */
    indices?: IElementBufferSourceTypes;

    /**
     * Uniform渲染数据
     */
    uniforms?: LazyObject<IGLUniforms>;

    /**
     * 绘制一定数量顶点。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawVertex
     */
    drawVertex?: IGLDrawVertex;

    /**
     * 根据索引数据绘制图元。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements
     */
    drawIndexed?: IGLDrawIndexed;

    /**
     * 回写顶点着色器中输出到缓冲区。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
     */
    transformFeedback?: IGLTransformFeedback;
}
