import { IGLBufferSource, IGLImageSource, IGLTextureSource } from "../data/IGLTexture";
import { getTexImageSourceSize } from "./getTexImageSourceSize";

export function getIGLTextureSourceSize(glTextureSource: IGLTextureSource)
{
    const size: [width: number, height?: number, depthOrArrayLayers?: number] = [] as any;

    //
    const glImageSource = glTextureSource as IGLImageSource;
    const glBufferSource = glTextureSource as IGLBufferSource;
    const source = glImageSource.source;
    if (source)
    {
        const texImageSourceSize = getTexImageSourceSize(source);
        size[0] = texImageSourceSize.width;
        size[1] = texImageSourceSize.height;
    }
    else 
    {
        size[0] = glBufferSource.width;
        size[1] = glBufferSource.height;
    }

    return size;
}
