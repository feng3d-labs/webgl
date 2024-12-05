import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IElementBufferSourceTypes, IGLIndexBuffer } from "../data/IGLIndexBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IElementBufferSourceTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLIndexBuffer(indices);

    const buffer = getWebGLBuffer(gl, indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

export const defaultIndexBuffer: IGLIndexBuffer = {
    target: "ELEMENT_ARRAY_BUFFER", usage: "STATIC_DRAW",
    data: new Uint16Array([0, 1, 2, 2, 1, 3])
};
Object.freeze(defaultIndexBuffer);

export function getIGLIndexBuffer(indices: IElementBufferSourceTypes)
{
    const indexBuffer: IGLIndexBuffer = indices[_IGLIndexBuffer] = indices[_IGLIndexBuffer] || {
        ...defaultIndexBuffer,
        data: indices,
    };

    return indexBuffer;
}

const _IGLIndexBuffer = "_IGLIndexBuffer";