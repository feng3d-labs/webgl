import { reactive } from '@feng3d/reactivity';
import { Buffer, IndicesDataTypes } from '@feng3d/render-api';
import { getGLBuffer } from '../caches/getGLBuffer';

export function runIndexBuffer(gl: WebGLRenderingContext, indices?: IndicesDataTypes)
{
    if (!indices) return;

    const indexBuffer = Buffer.getBuffer(indices.buffer);

    if (!indexBuffer.label)
    {
        reactive(indexBuffer).label = (`顶点索引 ${autoIndex++}`);
    }

    const buffer = getGLBuffer(gl, indexBuffer, 'ELEMENT_ARRAY_BUFFER', 'STATIC_DRAW');

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

let autoIndex = 0;