import { IGLTexture } from "./IGLTexture";

/**
 * GL中纹理之间拷贝。
 */
export interface IGLCopyTextureToTexture
{
    /**
     * 数据类型。
     */
    readonly __type: "CopyTextureToTexture";

    /**
     * Combined with `copySize`, defines the region of the source texture subresources.
     */
    source: IGLImageCopyTexture,

    /**
     * Combined with `copySize`, defines the region of the destination texture subresources.
     */
    destination: IGLImageCopyTexture,

    /**
     * 拷贝的尺寸。
     */
    copySize: IGLExtent3DStrict;
}

export interface IGLImageCopyTexture
{
    /**
     * Texture to copy to/from.
     */
    texture: IGLTexture;

    /**
     * Mip-map level of the {@link GPUImageCopyTexture#texture} to copy to/from.
     */
    mipLevel?: number;

    /**
     * Defines the origin of the copy - the minimum corner of the texture sub-region to copy to/from.
     * Together with `copySize`, defines the full copy sub-region.
     */
    origin?: [width: number, height: number, depth?: number];

    /**
     * Defines which aspects of the {@link GPUImageCopyTexture#texture} to copy to/from.
     */
    aspect?: GLTextureAspect;
}

export type GLTextureAspect = "all" | "stencil-only" | "depth-only";

export type IGLExtent3DStrict = [width: number, height: number, depthOrArrayLayers?: number];