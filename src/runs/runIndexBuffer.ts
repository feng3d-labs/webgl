import { IIndicesDataTypes } from "@feng3d/render-api";
import { getGLBuffer } from "../caches/getGLBuffer";
import { getIGLIndexBuffer } from "./getIGLBuffer";

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IIndicesDataTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLIndexBuffer(indices);

    const buffer = getGLBuffer(gl, indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

