import { getElementBuffer } from "../caches/getElementBuffer";
import { IIndexBuffer } from "../data/IIndexBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, index?: IIndexBuffer)
{
    if (index)
    {
        const buffer = getElementBuffer(gl, index);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
}

export const defaultIndexBuffer: IIndexBuffer = Object.freeze({ type: "UNSIGNED_SHORT", usage: "STATIC_DRAW", data: new Uint16Array([0, 1, 2, 2, 1, 3]) });
