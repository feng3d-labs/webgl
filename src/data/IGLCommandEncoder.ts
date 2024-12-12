import { ICommandEncoder, IPassEncoder, IRenderPass } from "@feng3d/render-api";
import { IGLBlitFramebuffer } from "./IGLBlitFramebuffer";
import { IGLCopyBufferToBuffer } from "./IGLCopyBufferToBuffer";
import { IGLCopyTextureToTexture } from "./IGLCopyTextureToTexture";

declare module "@feng3d/render-api"
{
    export interface IPassEncoderMap
    {
        IGLBlitFramebuffer: IGLBlitFramebuffer;
        IGLCopyTextureToTexture: IGLCopyTextureToTexture;
        IGLCopyBufferToBuffer: IGLCopyBufferToBuffer;
    }
}
