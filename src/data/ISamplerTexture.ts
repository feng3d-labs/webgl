import { ISampler } from "./ISampler";
import { ITexture } from "./ITexture";

/**
 * 采样纹理。
 *
 * 采样器与纹理。
 */
export interface ISamplerTexture
{
    texture: ITexture;

    /**
     * 采样器。
     */
    sampler?: ISampler;
}