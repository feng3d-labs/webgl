import { getElementWebGLBuffer } from "../caches/getWebGLElementBuffer";
import { IIndexBuffer } from "../data/IIndexBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, index?: IIndexBuffer)
{
    if (index)
    {
        const buffer = getElementWebGLBuffer(gl, index);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
}