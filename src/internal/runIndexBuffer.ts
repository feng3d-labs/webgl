import { IndicesDataTypes } from '@feng3d/render-api';
import { getGLBuffer } from '../caches/getGLBuffer';
import { getIGLBuffer } from '../runs/getIGLBuffer';

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IndicesDataTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLBuffer(indices, 'ELEMENT_ARRAY_BUFFER');
    indexBuffer.target ??= 'ELEMENT_ARRAY_BUFFER';
    indexBuffer.usage ??= 'STATIC_DRAW';

    const buffer = getGLBuffer(gl, indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

