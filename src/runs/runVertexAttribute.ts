import { getBufferType, getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IGLVertexAttribute } from "../data/IGLVertexAttribute";

export function runVertexAttribute(gl: WebGLRenderingContext, location: number, attribute: IGLVertexAttribute)
{
    const { numComponents, normalized, divisor } = attribute;
    let { vertexSize, offset } = attribute;

    gl.enableVertexAttribArray(location);

    if (divisor !== undefined)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.vertexAttribDivisor(location, divisor);
        }
        else
        {
            const extension = gl.getExtension("ANGLE_instanced_arrays");
            extension.vertexAttribDivisorANGLE(location, divisor);
        }
    }

    //
    const type = attribute.type || getBufferType(attribute.buffer.data) || "FLOAT";

    //
    vertexSize = vertexSize || 0;
    offset = offset || 0;

    //
    const webGLBuffer = getWebGLBuffer(gl, attribute.buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, webGLBuffer);

    //
    if (gl instanceof WebGL2RenderingContext && (type === "INT" || type === "UNSIGNED_INT"))
    {
        gl.vertexAttribIPointer(location, numComponents, gl[type], vertexSize, offset);
    }
    else
    {
        gl.vertexAttribPointer(location, numComponents, gl[type], normalized, vertexSize, offset);
    }
}
