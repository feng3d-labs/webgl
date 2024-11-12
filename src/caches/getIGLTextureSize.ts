import { IGLTexture } from "@feng3d/webgl-renderer";
import { getIGLTextureSourceSize } from "./getIGLTextureSourceSize";

export function getIGLTextureSize(glTexture: IGLTexture)
{
    let size: [width: number, height?: number, depthOrArrayLayers?: number];
    if (glTexture.storage)
    {
        size = [glTexture.storage.width, glTexture.storage.height];
        if (glTexture.storage.depth)
        {
            size.push(glTexture.storage.depth);
        }
    }

    //
    if (glTexture.sources)
    {
        size = getIGLTextureSourceSize(glTexture.sources[0]);
    }

    return size;
}