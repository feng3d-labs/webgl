import { IndicesDataTypes } from '@feng3d/render-api';
import { getGLBuffer } from '../caches/getGLBuffer';
import { getIGLBuffer } from '../runs/getIGLBuffer';

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IndicesDataTypes)
{
    if (!indices) return;

    const indexBuffer = getIGLBuffer(indices);

    const buffer = getGLBuffer(gl, indexBuffer, 'ELEMENT_ARRAY_BUFFER', 'STATIC_DRAW');
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

