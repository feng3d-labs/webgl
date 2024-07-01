import { RenderbufferInternalformat } from "../RenderBuffer";

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 */
export interface IRenderbuffer
{
    width: number,

    height: number

    internalformat: RenderbufferInternalformat,
}