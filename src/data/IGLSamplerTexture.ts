import { IGLSampler } from "./IGLSampler";
import { IGLTexture } from "./IGLTexture";

/**
 * 采样纹理。
 *
 * 采样器与纹理。
 */
export interface IGLSamplerTexture
{
    texture: IGLTexture;

    /**
     * 采样器。
     */
    sampler?: IGLSampler;
}