import { IIndicesDataTypes, IRenderObject, IVertexAttributes } from "@feng3d/render-api";

import { getBufferType } from "../caches/getGLBuffer";
import { IGLDrawMode } from "../caches/getIGLDrawMode";
import { ElementTypeMap } from "../const/IGLUniformType";
import { IGLDrawIndexed } from "../data/IGLDrawIndexed";
import { IGLDrawVertex } from "../data/IGLDrawVertex";

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

export const defaultDrawIndexed: IGLDrawIndexed = Object.freeze({ firstIndex: 0, instanceCount: 1 });

function _runDrawIndexed(gl: WebGLRenderingContext, drawMode: IGLDrawMode, indices: IIndicesDataTypes, drawIndexed: IGLDrawIndexed)
{
    const type = getBufferType(indices);
    const dataLength = indices.length;
    //
    let { indexCount, instanceCount, firstIndex } = drawIndexed || {};
    firstIndex = firstIndex || defaultDrawIndexed.firstIndex;
    instanceCount = instanceCount || defaultDrawIndexed.instanceCount;
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

export const defaultDrawVertex: IGLDrawVertex = Object.freeze({ vertexCount: 6, instanceCount: 1, firstVertex: 0 });

function _runDrawVertex(gl: WebGLRenderingContext, drawMode: IGLDrawMode, vertices: IVertexAttributes, drawArrays: IGLDrawVertex)
{
    //
    let { firstVertex, vertexCount, instanceCount } = drawArrays || {};
    //
    firstVertex = firstVertex || defaultDrawVertex.firstVertex;
    vertexCount = vertexCount || getAttributeVertexNum(vertices) || defaultDrawVertex.vertexCount;
    instanceCount = instanceCount || defaultDrawVertex.instanceCount;

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

/**
 * 获取属性顶点属性。
 */
export function getAttributeVertexNum(vertices: IVertexAttributes)
{
    const vertexNum = ((vertices) =>
    {
        for (const attr in vertices)
        {
            if (vertices.hasOwnProperty(attr))
            {
                return vertices[attr].data.length;
            }
        }

        return 0;
    })(vertices);

    return vertexNum;
}