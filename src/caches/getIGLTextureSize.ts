import { IGLTexture } from "@feng3d/webgl";
import { getIGLTextureSourceSize } from "./getIGLTextureSourceSize";

export function getIGLTextureSize(glTexture: IGLTexture)
{
    let size: [width: number, height?: number, depthOrArrayLayers?: number];
    if (glTexture.size)
    {
        size = [glTexture.size[0], glTexture.size[1]];
        if (glTexture.size[2])
        {
            size.push(glTexture.size[2]);
        }
    }

    //
    if (glTexture.sources)
    {
        size = getIGLTextureSourceSize(glTexture.sources[0]);
    }

    return size;
}