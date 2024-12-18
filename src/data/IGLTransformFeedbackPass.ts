import { IDrawVertex, IVertexAttributes, IVertexState } from "@feng3d/render-api";
import { LazyObject } from "../types";
import { ITransformFeedbackVaryings } from "./IGLRenderPipeline";
import { IGLTransformFeedback } from "./IGLTransformFeedback";
import { IGLUniforms } from "./IGLUniforms";

declare module "@feng3d/render-api"
{
    export interface IPassEncoderMap
    {
        IGLTransformFeedbackPass: IGLTransformFeedbackPass,
    }
}

export interface IGLTransformFeedbackPass
{
    /**
     * 数据类型。
     */
    readonly __type: "TransformFeedbackPass";

    /**
     * 计算对象列表。
     */
    computeObjects: IGLTransformFeedbackObject[];
}

export interface IGLTransformFeedbackObject
{
    /**
     * 渲染管线描述。
     */
    readonly pipeline: ITransformFeedbackPipeline;

    /**
     * 顶点属性数据映射。
     */
    vertices?: IVertexAttributes;

    /**
     * 根据顶点数据绘制图元。
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawVertex
     */
    readonly drawVertex?: IDrawVertex;

    /**
     * Uniform渲染数据
     */
    uniforms?: LazyObject<IGLUniforms>;

    /**
     * 回写顶点着色器中输出到缓冲区。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
     */
    transformFeedback?: IGLTransformFeedback;
}

export interface ITransformFeedbackPipeline
{
    /**
     * 顶点着色器阶段描述。
     */
    readonly vertex: IVertexState;

    /**
     * 回写变量。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/transformFeedbackVaryings
     */
    transformFeedbackVaryings?: ITransformFeedbackVaryings;

    /**
     * 是否丢弃后续光栅化阶段。
     *
     * gl.RASTERIZER_DISCARD
     */
    rasterizerDiscard?: boolean;
}