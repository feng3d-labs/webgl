import { IDrawVertex, IUniforms, IVertexAttributes, IVertexState } from "@feng3d/render-api";
import { IGLTransformFeedback } from "./IGLTransformFeedback";

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
     * 变换反馈对象列表。
     */
    transformFeedbackObjects: IGLTransformFeedbackObject[];
}

export interface IGLTransformFeedbackObject
{
    /**
     * 渲染管线描述。
     */
    readonly pipeline: IGLTransformFeedbackPipeline;

    /**
     * 顶点属性数据映射。
     */
    vertices: IVertexAttributes;

    /**
     * 根据顶点数据绘制图元。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawVertex
     */
    readonly drawVertex: IDrawVertex;

    /**
     * Uniform渲染数据
     */
    uniforms?: IUniforms;

    /**
     * 回写顶点着色器中输出到缓冲区。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
     */
    transformFeedback: IGLTransformFeedback;
}

export interface IGLTransformFeedbackPipeline
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
    transformFeedbackVaryings: IGLTransformFeedbackVaryings;
}

export interface IGLTransformFeedbackVaryings
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
