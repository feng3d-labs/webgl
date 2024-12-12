import { ITexture } from "@feng3d/render-api";
import { IGLSampler } from "./IGLSampler";

/**
 * 采样纹理。
 *
 * 采样器与纹理。
 */
export interface IGLSamplerTexture
{
    /**
     * 纹理。
     */
    texture: ITexture;

    /**
     * 采样器。
     */
    sampler?: IGLSampler;
}