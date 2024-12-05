import { getBufferType } from "../caches/getWebGLBuffer";
import { ElementTypeMap } from "../const/WebGLUniformType";
import { IGLDrawIndexed } from "../data/IGLDrawIndexed";
import { IGLDrawVertex } from "../data/IGLDrawVertex";
import { IGLIndexBuffer } from "../data/IGLIndexBuffer";
import { IGLDrawMode } from "../data/IGLPrimitiveState";
import { IGLRenderObject } from "../data/IGLRenderObject";
import { IGLVertexAttributes } from "../data/IGLVertexAttributes";
import { defaultPrimitiveState } from "./runPrimitiveState";

export function runDrawCall(gl: WebGLRenderingContext, renderObject: IGLRenderObject)
{
    const { pipeline, vertexArray, drawIndexed, drawVertex } = renderObject;
    const { vertices, index } = { ...vertexArray };

    const topology = pipeline.primitive?.topology || defaultPrimitiveState.topology;

    if (drawVertex)
    {
        _runDrawVertex(gl, topology, vertices, drawVertex);
    }
    else if (drawIndexed)
    {
        _runDrawIndexed(gl, topology, index, drawIndexed);
    }
    else if (index)
    {
        _runDrawIndexed(gl, topology, index, drawIndexed);
    }
    else
    {
        _runDrawVertex(gl, topology, vertices, drawVertex);
    }
}

export const defaultDrawIndexed: IGLDrawIndexed = Object.freeze({ firstIndex: 0, instanceCount: 1 });

function _runDrawIndexed(gl: WebGLRenderingContext, drawMode: IGLDrawMode, index: IGLIndexBuffer, drawIndexed: IGLDrawIndexed)
{
    const type = getBufferType(index.data);
    const dataLength = index.data.length;
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

function _runDrawVertex(gl: WebGLRenderingContext, drawMode: IGLDrawMode, vertices: IGLVertexAttributes, drawArrays: IGLDrawVertex)
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
export function getAttributeVertexNum(vertices: IGLVertexAttributes)
{
    const vertexNum = ((vertices) =>
    {
        for (const attr in vertices)
        {
            if (vertices.hasOwnProperty(attr))
            {
                return vertices[attr].buffer.data.length;
            }
        }

        return 0;
    })(vertices);

    return vertexNum;
}