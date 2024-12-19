import { ICommandEncoder, IPassEncoder, IRenderPass, ITextureLike } from "@feng3d/render-api";
import { IGLBlitFramebuffer } from "./IGLBlitFramebuffer";
import { IGLCopyBufferToBuffer } from "./IGLCopyBufferToBuffer";

declare module "@feng3d/render-api"
{
    export interface IPassEncoderMap
    {
        IGLBlitFramebuffer: IGLBlitFramebuffer;
        IGLCopyBufferToBuffer: IGLCopyBufferToBuffer;
    }

    /**
     * 被操作的纹理相关信息。
     *
     * {@link GPUCommandEncoder.copyTextureToTexture}
     * {@link GPUImageCopyTexture}
     */
    export interface IImageCopyTexture
    {
        /**
         * 
         * 注：当值设置为 null或者undefined时表示当前画布。
         */
        texture: ITextureLike;
    }
}
