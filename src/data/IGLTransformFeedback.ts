import { IGLVertexDataTypes } from "./IGLVertexAttributes";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/createTransformFeedback
 */
export interface IGLTransformFeedback
{
    /**
     * 绑定缓冲区列表。
     */
    bindBuffers: IGLTransformFeedbacBindBuffer[];
}

export interface IGLTransformFeedbacBindBuffer
{
    index: number;

    data: IGLVertexDataTypes;
}