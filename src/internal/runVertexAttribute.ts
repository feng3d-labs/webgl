import { Buffer, VertexAttribute, vertexFormatMap } from '@feng3d/render-api';
import { getGLBuffer } from '../caches/getGLBuffer';

export function runVertexAttribute(gl: WebGLRenderingContext, location: number, attribute: VertexAttribute)
{
    const { stepMode, format } = attribute;
    let { arrayStride, offset } = attribute;

    const glVertexFormat = vertexFormatMap[format];
    const { numComponents, normalized, type } = glVertexFormat;

    gl.enableVertexAttribArray(location);

    if (stepMode === 'instance')
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.vertexAttribDivisor(location, 1);
        }
        else
        {
            const extension = gl.getExtension('ANGLE_instanced_arrays');
            extension.vertexAttribDivisorANGLE(location, 1);
        }
    }

    //
    arrayStride = arrayStride || 0;
    offset = offset || 0;

    //
    const buffer = Buffer.getBuffer(attribute.data.buffer);

    const webGLBuffer = getGLBuffer(gl, buffer, 'ARRAY_BUFFER', 'STATIC_DRAW');
    gl.bindBuffer(gl.ARRAY_BUFFER, webGLBuffer);

    //
    if (gl instanceof WebGL2RenderingContext && (type === 'INT' || type === 'UNSIGNED_INT'))
    {
        gl.vertexAttribIPointer(location, numComponents, gl[type], arrayStride, offset);
    }
    else
    {
        gl.vertexAttribPointer(location, numComponents, gl[type], normalized, arrayStride, offset);
    }
}

