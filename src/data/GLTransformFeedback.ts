import { IVertexDataTypes } from "@feng3d/render-api";

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