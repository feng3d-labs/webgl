import { getGLBuffer } from "../caches/getGLBuffer";
import { IGLIndicesDataTypes } from "../data/IGLIndexBuffer";
import { getIGLIndexBuffer } from "./getIGLBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IGLIndicesDataTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLIndexBuffer(indices);

    const buffer = getGLBuffer(gl, indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

