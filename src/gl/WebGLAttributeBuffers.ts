import { watcher } from "@feng3d/watcher";
import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IVertexAttribute } from "../data/IVertexAttribute";

declare global
{
    interface WebGLRenderingContextExt
    {
        _attributeBuffers: WebGLAttributeBuffers;
    }
}

export class WebGLAttributeBuffers
{
    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._attributeBuffers = this;
    }

    vertexAttribPointer(location: number, attribute: IVertexAttribute)
    {
        const { gl } = this;
        const { buffer, itemSize, normalized } = attribute;

        const webGLBuffer = getWebGLBuffer(gl, buffer);
        const { type, bytesPerElement } = webGLBuffer;

        const stride = attribute.vertexSize || itemSize * bytesPerElement;
        const offset = attribute.offset || 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, webGLBuffer);

        if (gl instanceof WebGL2RenderingContext && (type === "INT" || type === "UNSIGNED_INT"))
        {
            gl.vertexAttribIPointer(location, itemSize, gl[type], stride, offset);
        }
        else
        {
            gl.vertexAttribPointer(location, itemSize, gl[type], normalized, stride, offset);
        }
    }
}
