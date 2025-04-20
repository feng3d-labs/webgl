import { TextureLike } from "@feng3d/render-api";
import { BlitFramebuffer } from "../BlitFramebuffer";

declare module "@feng3d/render-api"
{
    export interface PassEncoderMap
    {
        GLBlitFramebuffer: BlitFramebuffer;
    }

    /**
     * 被操作的纹理相关信息。
     *
     * {@link GPUCommandEncoder.copyTextureToTexture}
     * {@link GPUImageCopyTexture}
     */
    export interface ImageCopyTexture
    {
        /**
         *
         * 注：当值设置为 null或者undefined时表示当前画布。
         */
        texture: TextureLike;
    }
}
