export function getTexImageSourceSize(texImageSource: TexImageSource)
{
    let width: number;
    let height: number;
    if (texImageSource instanceof VideoFrame)
    {
        width = texImageSource.codedWidth;
        height = texImageSource.codedHeight;
    }
    else if (texImageSource instanceof HTMLVideoElement)
    {
        width = texImageSource.videoWidth;
        height = texImageSource.videoHeight;
    }
    else
    {
        width = texImageSource.width;
        height = texImageSource.height;
    }
    return { width, height };
}