import { ITexture, ITextureView } from "@feng3d/render-api";

/**
 * 纹理视图。
 */
export interface IGLTextureView extends ITextureView
{
    /**
     * 纹理。
     */
    readonly texture: ITexture,
}
