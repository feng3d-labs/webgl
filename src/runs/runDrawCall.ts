import { IDrawIndexed, IDrawVertex, IIndicesDataTypes, IRenderObject } from "@feng3d/render-api";

import { getBufferType } from "../caches/getGLBuffer";
import { IGLDrawMode } from "../caches/getIGLDrawMode";

export function runDrawCall(gl: WebGLRenderingContext, renderObject: IRenderObject, drawMode: IGLDrawMode)
{
    const { indices, drawIndexed, drawVertex } = renderObject;

    if (drawVertex)
    {
        _runDrawVertex(gl, drawMode, drawVertex);
    }
    else if (drawIndexed)
    {
        _runDrawIndexed(gl, drawMode, indices, drawIndexed);
    }
}

function _runDrawIndexed(gl: WebGLRenderingContext, drawMode: IGLDrawMode, indices: IIndicesDataTypes, drawIndexed: IDrawIndexed)
{
    const type = getBufferType(indices);
    //
    const indexCount = drawIndexed.indexCount;
    const firstIndex = drawIndexed.firstIndex || 0;
    const instanceCount = drawIndexed.instanceCount || 1;
    //
    const offset = firstIndex * indices.BYTES_PER_ELEMENT;

    //
    if (instanceCount > 1)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.drawElementsInstanced(gl[drawMode], indexCount, gl[type], offset, instanceCount);
        }
        else
        {
            const extension = gl.getExtension("ANGLE_instanced_arrays");
            extension.drawElementsInstancedANGLE(gl[drawMode], indexCount, gl[type], offset, instanceCount);
        }
    }
    else
    {
        gl.drawElements(gl[drawMode], indexCount, gl[type], offset);
    }
}

function _runDrawVertex(gl: WebGLRenderingContext, drawMode: IGLDrawMode, drawArrays: IDrawVertex)
{
    //
    const vertexCount = drawArrays.vertexCount;
    const firstVertex = drawArrays.firstVertex || 0;
    const instanceCount = drawArrays.instanceCount || 1;

    if (instanceCount > 1)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.drawArraysInstanced(gl[drawMode], firstVertex, vertexCount, instanceCount);
        }
        else
        {
            const extension = gl.getExtension("ANGLE_instanced_arrays");
            extension.drawArraysInstancedANGLE(gl[drawMode], firstVertex, vertexCount, instanceCount);
        }
    }
    else
    {
        gl.drawArrays(gl[drawMode], firstVertex, vertexCount);
    }
}
