import { getTexImageSourceSize, IImageSize, ITextureSize } from "@feng3d/render-api";
import { IGLImageSource, IGLTexture, IGLTextureSource } from "@feng3d/webgl";

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
    let maxDepthOrArrayLayers: number = 1;
    //
    for (let i = 0; i < sources.length; i++)
    {
        const element = sources[i];
        element.level = element.level || 0;
        element.xoffset = element.xoffset || 0;
        element.yoffset = element.yoffset || 0;
        element.zoffset = element.zoffset || 0;
        element.depthOrArrayLayers = element.depthOrArrayLayers || 1;
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

            maxDepthOrArrayLayers = Math.max(maxDepthOrArrayLayers, element.zoffset + element.depthOrArrayLayers);
        }
    }

    return [width, height, maxDepthOrArrayLayers]; // 总深度比最大深度大1
}

function getIGLTextureSourceSize(glTextureSource: IGLTextureSource): IImageSize
{
    if (glTextureSource.width && glTextureSource.height)
    {
        return [glTextureSource.width, glTextureSource.height]
    }

    const glImageSource = glTextureSource as IGLImageSource;
    const texImageSourceSize = getTexImageSourceSize(glImageSource.source);

    glTextureSource.width = glTextureSource.width || texImageSourceSize[0];
    glTextureSource.height = glTextureSource.height || texImageSourceSize[1];

    return [glTextureSource.width, glTextureSource.height];
}
