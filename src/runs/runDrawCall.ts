import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { getElementWebGLBuffer } from "../caches/getWebGLElementBuffer";
import { ElementTypeMap } from "../const/WebGLUniformType";
import { IRenderObject } from "../data/IRenderObject";
import { WebGLAttributeBuffers } from "../gl/WebGLAttributeBuffers";

export function runDrawCall(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    if (renderAtomic.drawVertex)
    {
        _runDrawVertex(gl, renderAtomic);
    }
    else if (renderAtomic.drawIndexed)
    {
        _runDrawIndexed(gl, renderAtomic);
    }
    else
    {
        renderAtomic.index ? _runDrawIndexed(gl, renderAtomic) : _runDrawVertex(gl, renderAtomic);
    }
}

function _runDrawIndexed(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    const { _info } = gl;
    //
    const drawMode = renderAtomic.pipeline.primitive?.topology || "TRIANGLES";
    //
    const element = getElementWebGLBuffer(gl, renderAtomic.index);
    const type = element.type;
    //
    const drawIndexed = renderAtomic.drawIndexed || {};
    const firstIndex = drawIndexed.firstIndex || 0;
    const instanceCount = drawIndexed.instanceCount || 1;
    const indexCount = drawIndexed.indexCount || (element.count - firstIndex);

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
        _info.update(indexCount, drawMode, instanceCount);
    }
    else
    {
        gl.drawElements(gl[drawMode], indexCount, gl[type], firstIndex * ElementTypeMap[type]);
        _info.update(indexCount, drawMode, 1);
    }
}

function _runDrawVertex(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    const { _attributeBuffers, _info } = gl;
    //
    const vertexNum = getAttributeVertexNum(gl, _attributeBuffers, renderAtomic);
    const drawMode = renderAtomic.pipeline.primitive?.topology || "TRIANGLES";
    //
    const drawCall = renderAtomic.drawVertex || {};
    //
    const firstVertex = drawCall.firstVertex || 0;
    const vertexCount = drawCall.vertexCount || vertexNum || 6;
    const instanceCount = drawCall.instanceCount || 1;

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
        _info.update(vertexCount, drawMode, instanceCount);
    }
    else
    {
        gl.drawArrays(gl[drawMode], firstVertex, vertexCount);
        _info.update(vertexCount, drawMode, 1);
    }
}

/**
 * 获取属性顶点属性。
 *
 * @param attributes
 * @returns
 */
function getAttributeVertexNum(gl: WebGLRenderingContext, attributes: WebGLAttributeBuffers, renderAtomic: IRenderObject)
{
    const vertexNum = ((attributelist) =>
    {
        for (const attr in attributelist)
        {
            // eslint-disable-next-line no-prototype-builtins
            if (attributelist.hasOwnProperty(attr))
            {
                const buffer = getWebGLBuffer(gl, attributelist[attr].buffer);

                return buffer.count;
            }
        }

        return 0;
    })(renderAtomic.attributes);

    return vertexNum;
}