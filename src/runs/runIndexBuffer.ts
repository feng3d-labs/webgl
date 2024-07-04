import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IIndexBuffer } from "../data/IIndexBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, index?: IIndexBuffer)
{
    if (index)
    {
        const buffer = getWebGLBuffer(gl, index);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
}

export const defaultIndexBuffer: IIndexBuffer = { target: "ELEMENT_ARRAY_BUFFER", type: "UNSIGNED_SHORT", usage: "STATIC_DRAW", data: new Uint16Array([0, 1, 2, 2, 1, 3]) };
Object.freeze(defaultIndexBuffer);