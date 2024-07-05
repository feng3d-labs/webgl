import { IBuffer } from "./IBuffer";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/createTransformFeedback
 */
export interface ITransformFeedback
{
    index: number;

    buffer: IBuffer;
}