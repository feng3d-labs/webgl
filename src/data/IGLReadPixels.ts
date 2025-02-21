import { RenderPassDescriptor } from "@feng3d/render-api";
import { GLAttachmentPoint } from "../gl/WebGLEnums";
import { IGLTextureDataType, IGLTextureFormat } from "./IGLTexture";

/**
 * 读取渲染缓冲区或者纹理视图中的像素值。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
 */
export interface IGLReadPixels
{
    frameBuffer: RenderPassDescriptor;

    /**
     * 读取那个附件。
     */
    attachmentPoint: GLAttachmentPoint;

    x: number,
    y: number,
    width: number,
    height: number,

    /**
     * 纹理格式。
     *
     * 默认 "RGBA"。
     */
    format?: IGLTextureFormat;

    /**
     * 数据类型。
     *
     * 默认 "UNSIGNED_BYTE"。
     */
    type?: IGLTextureDataType;

    dstData: ArrayBufferView,
    dstOffset: number
}
