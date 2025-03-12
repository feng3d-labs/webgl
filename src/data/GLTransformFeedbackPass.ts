import { DrawVertex, IVertexDataTypes, Uniforms, VertexAttributes, VertexState } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    export interface PassEncoderMap
    {
        GLTransformFeedbackPass: GLTransformFeedbackPass,
    }
}

export interface GLTransformFeedbackPass
{
    /**
     * 数据类型。
     */
    readonly __type__: "TransformFeedbackPass";

    /**
     * 变换反馈对象列表。
     */
    transformFeedbackObjects: GLTransformFeedbackObject[];
}

export interface GLTransformFeedbackObject
{
    /**
     * 渲染管线描述。
     */
    readonly pipeline: GLTransformFeedbackPipeline;

    /**
     * 顶点属性数据映射。
     */
    vertices: VertexAttributes;

    /**
     * 根据顶点数据绘制图元。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawVertex
     */
    readonly draw: DrawVertex;

    /**
     * Uniform渲染数据
     */
    uniforms?: Uniforms;

    /**
     * 回写顶点着色器中输出到缓冲区。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/bindTransformFeedback
     */
    transformFeedback: GLTransformFeedback;
}

export interface GLTransformFeedbackPipeline
{
    /**
     * 顶点着色器阶段描述。
     */
    readonly vertex: VertexState;

    /**
     * 回写变量。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/transformFeedbackVaryings
     */
    transformFeedbackVaryings: GLTransformFeedbackVaryings;
}

export interface GLTransformFeedbackVaryings
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
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/createTransformFeedback
 */
export interface GLTransformFeedback
{
    /**
     * 绑定缓冲区列表。
     */
    bindBuffers: GLTransformFeedbacBindBuffer[];
}

export interface GLTransformFeedbacBindBuffer
{
    index: number;

    data: IVertexDataTypes;
}