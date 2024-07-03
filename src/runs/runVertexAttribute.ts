import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IVertexAttribute } from "../data/IVertexAttribute";

export function runVertexAttribute(gl: WebGLRenderingContext, location: number, attribute: IVertexAttribute)
{
    const { numComponents, normalized, divisor } = attribute;
    let { vertexSize, offset } = attribute;

    gl.enableVertexAttribArray(location);

    if (divisor)
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
    const webGLBuffer = getWebGLBuffer(gl, attribute.buffer, attribute.type);

    //
    const { type, bytesPerElement } = webGLBuffer;

    //
    vertexSize = vertexSize || numComponents * bytesPerElement;
    offset = offset || 0;

    //
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
