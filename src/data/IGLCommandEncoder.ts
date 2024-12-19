import { ICommandEncoder, IPassEncoder, IRenderPass } from "@feng3d/render-api";
import { IGLBlitFramebuffer } from "./IGLBlitFramebuffer";
import { IGLCopyBufferToBuffer } from "./IGLCopyBufferToBuffer";

declare module "@feng3d/render-api"
{
    export interface IPassEncoderMap
    {
        IGLBlitFramebuffer: IGLBlitFramebuffer;
        IGLCopyBufferToBuffer: IGLCopyBufferToBuffer;
    }
}
