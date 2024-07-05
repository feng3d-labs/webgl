import { IColorTargetState } from "./IColorTargetState";
import { IDepthStencilState } from "./IDepthStencilState";
import { IPrimitiveState } from "./IPrimitiveState";

/**
 * @deprecated 请使用 `IRenderPipeline` 。
 */
export type IProgram = IRenderPipeline;

/**
 * shader
 */
export interface IRenderPipeline
{
    /**
     * 顶点着色器代码
     */
    vertex: IVertexState;

    /**
     * 片段着色器代码
     */
    fragment: IFragmentState;

    /**
     * 回写变量。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/transformFeedbackVaryings
     */
    transformFeedbackVaryings?: ITransformFeedbackVaryings;

    /**
     * 图元拓扑结构。
     */
    primitive?: IPrimitiveState;

    /**
     * 描述可选的深度模板的测试、运算以及偏差。
     */
    depthStencil?: IDepthStencilState;
}

export interface ITransformFeedbackVaryings
{
    /**
     * 回写变量列表。
     */
    varyings: string[];

    /**
     * 交叉或者分离。
     */
    bufferMode: "INTERLEAVED_ATTRIBS" | "SEPARATE_ATTRIBS";
}

/**
 * 顶点程序阶段。
 */
export interface IVertexState
{
    code: string;
}

/**
 * GPU片元程序阶段。
 */
export interface IFragmentState
{
    /**
     * 着色器源码。
     */
    code: string,

    /**
     * 定义了该管道写入的颜色目标的格式和行为。
     */
    targets?: IColorTargetState[]
}