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
    const sources = glTexture.sources;
    if (sources)
    {
        for (let i = 0; i < sources.length; i++)
        {
            const element = sources[i];
            // 取mipmap为0位置的资源
            if (!element.level)
            {
                size = getIGLTextureSourceSize(sources[i]);
                break;
            }
        }
    }

    return size;
}