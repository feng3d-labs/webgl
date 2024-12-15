import { IDrawVertex, IIndicesDataTypes, IRenderObject, IVertexAttributes } from "@feng3d/render-api";

import { getBufferType } from "../caches/getGLBuffer";
import { IGLDrawMode } from "../caches/getIGLDrawMode";
import { ElementTypeMap } from "../const/IGLUniformType";
import { IGLDrawIndexed } from "../data/IGLDrawIndexed";

export function runDrawCall(gl: WebGLRenderingContext, renderObject: IRenderObject, drawMode: IGLDrawMode)
{
    const { vertices, indices, drawIndexed, drawVertex } = renderObject;

    if (drawVertex)
    {
        _runDrawVertex(gl, drawMode, vertices, drawVertex);
    }
    else if (drawIndexed)
    {
        _runDrawIndexed(gl, drawMode, indices, drawIndexed);
    }
    else if (indices)
    {
        _runDrawIndexed(gl, drawMode, indices, drawIndexed);
    }
    else
    {
        _runDrawVertex(gl, drawMode, vertices, drawVertex);
    }
}

function _runDrawIndexed(gl: WebGLRenderingContext, drawMode: IGLDrawMode, indices: IIndicesDataTypes, drawIndexed: IGLDrawIndexed)
{
    const type = getBufferType(indices);
    const dataLength = indices.length;
    //
    let { indexCount, instanceCount, firstIndex } = drawIndexed || {};
    firstIndex = firstIndex || 0;
    instanceCount = instanceCount || 1;
    indexCount = indexCount || (dataLength - firstIndex);

    //
    if (instanceCount > 1)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.drawElementsInstanced(gl[drawMode], indexCount, gl[type], firstIndex * ElementTypeMap[type], instanceCount);
        }
        else
        {
            const extension = gl.getExtension("ANGLE_instanced_arrays");
            extension.drawElementsInstancedANGLE(gl[drawMode], indexCount, gl[type], firstIndex * ElementTypeMap[type], instanceCount);
        }
    }
    else
    {
        gl.drawElements(gl[drawMode], indexCount, gl[type], firstIndex * ElementTypeMap[type]);
    }
}

function _runDrawVertex(gl: WebGLRenderingContext, drawMode: IGLDrawMode, vertices: IVertexAttributes, drawArrays: IDrawVertex)
{
    //
    let { firstVertex, vertexCount, instanceCount } = drawArrays || {};
    //
    firstVertex = firstVertex || 0;
    instanceCount = instanceCount || 1;

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
