import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IVertexAttribute } from "../data/IVertexAttribute";

export function runVertexAttribute(gl: WebGLRenderingContext, location: number, attribute: IVertexAttribute)
{
    const { buffer, itemSize, normalized } = attribute;
    let { vertexSize, offset, divisor } = attribute;

    //
    const webGLBuffer = getWebGLBuffer(gl, buffer);
    const { type, bytesPerElement } = webGLBuffer;

    //
    vertexSize = vertexSize || itemSize * bytesPerElement;
    offset = offset || 0;

    divisor = ~~divisor;

    gl.enableVertexAttribArray(location);

    if (gl instanceof WebGL2RenderingContext)
    {
        gl.vertexAttribDivisor(location, divisor);
    }
    else
    {
        const extension = gl.getExtension("ANGLE_instanced_arrays");
        extension.vertexAttribDivisorANGLE(location, divisor);
    }

    //
    gl.bindBuffer(gl.ARRAY_BUFFER, webGLBuffer);

    //
    if (gl instanceof WebGL2RenderingContext && (type === "INT" || type === "UNSIGNED_INT"))
    {
        gl.vertexAttribIPointer(location, itemSize, gl[type], vertexSize, offset);
    }
    else
    {
        gl.vertexAttribPointer(location, itemSize, gl[type], normalized, vertexSize, offset);
    }
}
