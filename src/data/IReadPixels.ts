import { AttachmentPoint } from "../gl/WebGLEnums";
import { IFramebuffer } from "./IFramebuffer";
import { TextureDataType, TextureFormat } from "./ITexture";

/**
 * 读取渲染缓冲区或者纹理视图中的像素值。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
 */
export interface IReadPixels
{
    frameBuffer: IFramebuffer;

    /**
     * 读取那个附件。
     */
    attachmentPoint: AttachmentPoint;

    x: number,
    y: number,
    width: number,
    height: number,

    /**
     * 纹理格式。
     *
     * 默认 "RGBA"。
     */
    format?: TextureFormat;

    /**
     * 数据类型。
     *
     * 默认 "UNSIGNED_BYTE"。
     */
    type?: TextureDataType;

    dstData: ArrayBufferView,
    dstOffset: number
}
