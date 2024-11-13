import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IGLIndexBuffer } from "../data/IGLIndexBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, index?: IGLIndexBuffer)
{
    if (index)
    {
        const buffer = getWebGLBuffer(gl, index);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
}

export const defaultIndexBuffer: IGLIndexBuffer = {
    target: "ELEMENT_ARRAY_BUFFER", usage: "STATIC_DRAW",
    data: new Uint16Array([0, 1, 2, 2, 1, 3])
};
Object.freeze(defaultIndexBuffer);
