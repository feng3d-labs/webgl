import { ICommandEncoder } from "@feng3d/render-api";
import { IGLBlitFramebuffer } from "./IGLBlitFramebuffer";
import { IGLCopyBufferToBuffer } from "./IGLCopyBufferToBuffer";
import { IGLCopyTextureToTexture } from "./IGLCopyTextureToTexture";
import { IGLRenderPass } from "./IGLRenderPass";

declare module "@feng3d/render-api"
{
    export interface IPassEncoderMap
    {
        IGLBlitFramebuffer: IGLBlitFramebuffer;
        IGLCopyTextureToTexture: IGLCopyTextureToTexture;
        IGLCopyBufferToBuffer: IGLCopyBufferToBuffer;
    }
}

/**
 * 命令编码器。
 */
export interface IGLCommandEncoder extends ICommandEncoder
{
    /**
     * 通道编码器列表。
     *
     * 包括计算通道编码器、渲染通道编码器 以及 GPU中缓存与纹理之间拷贝。
     */
    passEncoders: IGLPassEncoder[];
}

/**
 * 通道编码器。
 *
 * 包括计算通道编码器、渲染通道编码器 以及 GPU中缓存与纹理之间拷贝。
 *
 * 通道可以理解为源数据通过某种操作到目标数据的映射，该操作可以是计算模块、也可以是渲染模块、也可以是简单的拷贝或者转换。
 */
export type IGLPassEncoder = IGLRenderPass | IGLBlitFramebuffer | IGLCopyTextureToTexture | IGLCopyBufferToBuffer;
