import { getTexImageSourceSize } from "@feng3d/render-api";
import { IGLBufferSource, IGLImageSource, IGLTexture, IGLTextureSource } from "@feng3d/webgl";

export function getIGLTextureSize(glTexture: IGLTexture)
{
    if (glTexture.size) return glTexture.size;

    //
    const sources = glTexture.sources;
    if (sources)
    {
        const sourcesSize = getIGLTextureSourcesSize(glTexture.sources);
        if (sourcesSize)
        {
            return sourcesSize;
        }
    }

    return undefined;
}

export function getIGLTextureSourcesSize(sources: IGLTextureSource[])
{
    for (let i = 0; i < sources.length; i++)
    {
        const element = sources[i];
        // 取mipmap为0位置的资源
        if (!element.level)
        {
            const size = getIGLTextureSourceSize(sources[i]);
            return size;
        }
    }

    return undefined;
}

function getIGLTextureSourceSize(glTextureSource: IGLTextureSource)
{
    const size: [width: number, height?: number, depthOrArrayLayers?: number] = [] as any;

    //
    const glImageSource = glTextureSource as IGLImageSource;
    const glBufferSource = glTextureSource as IGLBufferSource;
    const source = glImageSource.source;
    if (source)
    {
        const texImageSourceSize = getTexImageSourceSize(source);
        size[0] = texImageSourceSize[0];
        size[1] = texImageSourceSize[1];
    }
    else 
    {
        size[0] = glBufferSource.width;
        size[1] = glBufferSource.height;
    }

    if (glTextureSource.depthOrArrayLayers)
    {
        size[2] = glTextureSource.depthOrArrayLayers;
    }

    return size;
}
