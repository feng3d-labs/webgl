import { IBuffer } from "./IBuffer";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/createTransformFeedback
 */
export interface ITransformFeedback
{
    /**
     * 绑定缓冲区列表。
     */
    bindBuffers: ITransformFeedbacBindBuffer[];
}

export interface ITransformFeedbacBindBuffer
{
    index: number;

    buffer: IBuffer;
}