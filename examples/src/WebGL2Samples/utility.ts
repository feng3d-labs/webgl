export function getShaderSource(id: string)
{
    return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, "");
}