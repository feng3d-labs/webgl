import { ITextureView } from "@feng3d/render-api";
import { IGLTexture } from "./IGLTexture";

/**
 * 纹理视图。
 */
export interface IGLTextureView extends ITextureView
{
    /**
     * 纹理。
     */
    readonly texture: IGLTexture,
}
