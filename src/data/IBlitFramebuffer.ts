import { IWebGLPassDescriptor } from "./IWebGLPassDescriptor";

/**
 * 拷贝渲染缓冲与纹理直接拷贝数据。
 */
export interface IBlitFramebuffer
{
    read: IWebGLPassDescriptor;
    draw: IWebGLPassDescriptor;
    blitFramebuffers: IBlitFramebufferItem[];
}

export type IBlitFramebufferItem = [
    srcX0: number, srcY0: number, srcX1: number, srcY1: number,
    dstX0: number, dstY0: number, dstX1: number, dstY1: number,
    mask: "COLOR_BUFFER_BIT" | "DEPTH_BUFFER_BIT" | "STENCIL_BUFFER_BIT", filter: "NEAREST" | "LINEAR"];