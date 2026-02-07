import { Sampler, Texture } from '@feng3d/render-api';

/**
 * 采样纹理。
 *
 * 采样器与纹理。
 */
export interface SamplerTexture
{
    /**
     * 纹理。
     */
    texture: Texture;

    /**
     * 采样器。
     */
    sampler?: Sampler;
}
