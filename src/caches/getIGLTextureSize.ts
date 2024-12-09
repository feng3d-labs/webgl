import { getTexImageSourceSize, IImageSize, ITextureSize } from "@feng3d/render-api";
import { IGLBufferSource, IGLImageSource, IGLTexture, IGLTextureSource } from "@feng3d/webgl";

export function getIGLTextureSize(glTexture: IGLTexture)
{
    if (glTexture.size) return glTexture.size;

    //
    const sourcesSize = getIGLTextureSourcesSize(glTexture.sources);
    return sourcesSize;
}

export function getIGLTextureSourcesSize(sources?: IGLTextureSource[]): ITextureSize
{
    if (!sources) return undefined;

    let width: number;
    let height: number;
    let maxDepthOrArrayLayers: number = 0;
    //
    for (let i = 0; i < sources.length; i++)
    {
        const element = sources[i];
        // 取mipmap为0位置的资源
        if (!element.level)
        {
            //
            const sourceSize = getIGLTextureSourceSize(element);
            if (width || height)
            {
                console.assert(width === sourceSize[0] && height === sourceSize[1], `纹理资源中提供的尺寸不正确！`);
            }
            else
            {
                width = sourceSize[0];
                height = sourceSize[1];
            }

            if (element.depthOrArrayLayers)
            {
                maxDepthOrArrayLayers = Math.max(maxDepthOrArrayLayers, element.depthOrArrayLayers);
            }
        }
    }

    return [width, height, maxDepthOrArrayLayers + 1]; // 总深度比最大深度大1
}

function getIGLTextureSourceSize(glTextureSource: IGLTextureSource): IImageSize
{
    const glImageSource = glTextureSource as IGLImageSource;
    const source = glImageSource.source;
    if (source)
    {
        const texImageSourceSize = getTexImageSourceSize(source);
        return texImageSourceSize;
    }
    const glBufferSource = glTextureSource as IGLBufferSource;

    return [glBufferSource.width, glBufferSource.height];
}
