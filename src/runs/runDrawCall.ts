import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { ElementTypeMap } from "../const/WebGLUniformType";
import { IDrawArrays } from "../data/IDrawArrays";
import { IDrawElements } from "../data/IDrawElements";
import { IIndexBuffer } from "../data/IIndexBuffer";
import { IDrawMode } from "../data/IPrimitiveState";
import { IRenderObject } from "../data/IRenderObject";
import { IVertexAttributes } from "../data/IVertexAttributes";
import { defaultPrimitiveState } from "./runPrimitiveState";

export function runDrawCall(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const { pipeline, vertexArray, drawElements, drawArrays } = renderObject;
    const { vertices, index } = { ...vertexArray };

    const topology = pipeline.primitive?.topology || defaultPrimitiveState.topology;

    if (drawArrays)
    {
        _runDrawArrays(gl, topology, vertices, drawArrays);
    }
    else if (drawElements)
    {
        _runDrawElements(gl, topology, index, drawElements);
    }
    else if (index)
    {
        _runDrawElements(gl, topology, index, drawElements);
    }
    else
    {
        _runDrawArrays(gl, topology, vertices, drawArrays);
    }
}

export const defaultDrawIndexed: IDrawElements = Object.freeze({ firstIndex: 0, instanceCount: 1 });

function _runDrawElements(gl: WebGLRenderingContext, drawMode: IDrawMode, index: IIndexBuffer, drawElements: IDrawElements)
{
    //
    const webGLBuffer = getWebGLBuffer(gl, index);
    const type = webGLBuffer.data.bufferType;
    const dataLength = webGLBuffer.data.length;
    //
    let { indexCount, instanceCount, firstIndex } = drawElements || {};
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

export const defaultDrawVertex: IDrawArrays = Object.freeze({ vertexCount: 6, instanceCount: 1, firstVertex: 0 });

function _runDrawArrays(gl: WebGLRenderingContext, drawMode: IDrawMode, vertices: IVertexAttributes, drawArrays: IDrawArrays)
{
    //
    let { firstVertex, vertexCount, instanceCount } = drawArrays || {};
    //
    firstVertex = firstVertex || defaultDrawVertex.firstVertex;
    vertexCount = vertexCount || getAttributeVertexNum(gl, vertices) || defaultDrawVertex.vertexCount;
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
function getAttributeVertexNum(gl: WebGLRenderingContext, vertices: IVertexAttributes)
{
    const vertexNum = ((vertices) =>
    {
        for (const attr in vertices)
        {
            if (vertices.hasOwnProperty(attr))
            {
                const buffer = getWebGLBuffer(gl, vertices[attr].buffer);

                return buffer.data.length;
            }
        }

        return 0;
    })(vertices);

    return vertexNum;
}