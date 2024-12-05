import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IElementBufferSourceTypes } from "../data/IGLIndexBuffer";
import { getIGLIndexBuffer } from "./getIGLBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IElementBufferSourceTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLIndexBuffer(indices);

    const buffer = getWebGLBuffer(gl, indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

