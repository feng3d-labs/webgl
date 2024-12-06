import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IGLIndicesDataTypes } from "../data/IGLIndexBuffer";
import { getIGLIndexBuffer } from "./getIGLBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IGLIndicesDataTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLIndexBuffer(indices);

    const buffer = getWebGLBuffer(gl, indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

