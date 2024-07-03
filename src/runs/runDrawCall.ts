import { getAttributeBuffer } from "../caches/getAttributeBuffer";
import { getElementBuffer } from "../caches/getElementBuffer";
import { ElementTypeMap } from "../const/WebGLUniformType";
import { IDrawElements } from "../data/IDrawElements";
import { IDrawArrays } from "../data/IDrawArrays";
import { IRenderObject } from "../data/IRenderObject";

export function runDrawCall(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    if (renderObject.drawArrays)
    {
        _runDrawArrays(gl, renderObject);
    }
    else if (renderObject.drawElements)
    {
        _runDrawElements(gl, renderObject);
    }
    else
    {
        renderObject.vertexArray?.index ? _runDrawElements(gl, renderObject) : _runDrawArrays(gl, renderObject);
    }
}

export const defaultDrawIndexed: IDrawElements = Object.freeze({ firstIndex: 0, instanceCount: 1 });

function _runDrawElements(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    //
    const drawMode = renderObject.pipeline.primitive?.topology || "TRIANGLES";
    //
    const element = getElementBuffer(gl, renderObject.vertexArray.index);
    const type = element.type;
    //
    let { indexCount, instanceCount, firstIndex } = renderObject.drawElements || {};
    firstIndex = firstIndex || defaultDrawIndexed.firstIndex;
    instanceCount = instanceCount || defaultDrawIndexed.instanceCount;
    indexCount = indexCount || (element.count - firstIndex);

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

function _runDrawArrays(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    //
    const drawMode = renderObject.pipeline.primitive?.topology || "TRIANGLES";
    //
    let { firstVertex, vertexCount, instanceCount } = renderObject.drawArrays || {};
    //
    firstVertex = firstVertex || defaultDrawVertex.firstVertex;
    vertexCount = vertexCount || getAttributeVertexNum(gl, renderObject) || defaultDrawVertex.vertexCount;
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
function getAttributeVertexNum(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const vertexNum = ((vertices) =>
    {
        for (const attr in vertices)
        {
            if (vertices.hasOwnProperty(attr))
            {
                const buffer = getAttributeBuffer(gl, vertices[attr]);

                return buffer.count;
            }
        }

        return 0;
    })(renderObject.vertexArray?.vertices);

    return vertexNum;
}