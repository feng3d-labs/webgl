export function getShaderSource(id: string)
{
    return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
}

export function loadImage(url: string, onload: (img: HTMLImageElement) => void)
{
    const img = new Image();

    img.src = url;
    img.onload = function ()
    {
        onload(img);
    };

    return img;
}
