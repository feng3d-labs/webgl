import { getDrawCall } from "../caches/getDrawCall";
import { getWebGLDrawIndexed } from "../caches/getWebGLDrawIndexed";
import { getElementWebGLBuffer } from "../caches/getWebGLElementBuffer";
import { ElementTypeMap } from "../const/WebGLUniformType";
import { DrawElementType } from "../data/ElementBuffer";
import { RenderAtomic } from "../data/RenderAtomic";
import { WebGLAttributeBuffers } from "../gl/WebGLAttributeBuffers";

export function runDrawCall(gl: WebGLRenderingContext, renderAtomic: RenderAtomic)
{
    const { _attributeBuffers, _info } = gl;

    if (renderAtomic.drawCall)
    {
        const drawCall = renderAtomic.drawCall;
        const drawMode = drawCall.drawMode || "TRIANGLES";

        const { drawMode, firstVertex, vertexCount, instanceCount } = drawCall;

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
    else if (renderAtomic.drawIndexed)
    {
        const drawIndexed = getWebGLDrawIndexed(renderAtomic.drawIndexed);

        const { drawMode, indexCount, instanceCount, firstIndex } = drawIndexed;

        //
        const elementCache = getElementWebGLBuffer(gl, renderAtomic.index);
        const vertexNum = elementCache.count;
        const type = elementCache.type;

        if (instanceCount > 1)
        {
            if (gl instanceof WebGL2RenderingContext)
            {
                gl.drawElementsInstanced(gl[drawMode], indexCount, gl[type], firstIndex, instanceCount);
            }
            else
            {
                const extension = gl.getExtension("ANGLE_instanced_arrays");
                extension.drawElementsInstancedANGLE(gl[drawMode], indexCount, gl[type], firstIndex, instanceCount);
            }
            _info.update(indexCount, drawMode, instanceCount);
        }
        else
        {
            gl.drawElements(gl[drawMode], indexCount, gl[type], firstIndex * ElementTypeMap[type]);
            _info.update(indexCount, drawMode, 1);
        }
    }

    // let instanceCount = drawCall.instanceCount;
    // const drawMode = drawCall.drawMode;
    // let offset = drawCall.offset;
    // let count = drawCall.count;

    // const element = renderAtomic.index;

    // let vertexNum: number;
    // let type: DrawElementType;

    // if (element)
    // {
    //     const elementCache = getElementWebGLBuffer(gl, element);
    //     vertexNum = elementCache.count;
    //     type = elementCache.type;
    // }
    // else
    // {
    //     vertexNum = getAttributeVertexNum(_attributeBuffers, renderAtomic);

    //     if (vertexNum === 0)
    //     {
    //         // console.warn(`顶点数量为0，不进行渲染！`);

    //         // return;
    //         vertexNum = 6;
    //     }
    // }

    // if (offset === undefined)
    // {
    //     offset = 0;
    // }

    // if (count === undefined)
    // {
    //     count = vertexNum - offset;
    // }

    // if (instanceCount > 1)
    // {
    //     if (element)
    //     {
    //         if (gl instanceof WebGL2RenderingContext)
    //         {
    //             gl.drawElementsInstanced(gl[drawMode], count, gl[type], offset, instanceCount);
    //         }
    //         else
    //         {
    //             const extension = gl.getExtension("ANGLE_instanced_arrays");
    //             extension.drawElementsInstancedANGLE(gl[drawMode], count, gl[type], offset, instanceCount);
    //         }
    //     }
    //     else if (gl instanceof WebGL2RenderingContext)
    //     {
    //         gl.drawArraysInstanced(gl[drawMode], offset, count, instanceCount);
    //     }
    //     else
    //     {
    //         const extension = gl.getExtension("ANGLE_instanced_arrays");
    //         extension.drawArraysInstancedANGLE(gl[drawMode], offset, count, instanceCount);
    //     }
    // }
    // else
    // {
    //     if (element)
    //     {
    //         gl.drawElements(gl[drawMode], count, gl[type], offset * ElementTypeMap[type]);
    //     }
    //     else
    //     {
    //         gl.drawArrays(gl[drawMode], offset, count);
    //     }
    //     instanceCount = 1;
    // }

    // _info.update(count, drawMode, instanceCount);
}

/**
 * 获取属性顶点属性。
 *
 * @param attributes
 * @returns
 */
function getAttributeVertexNum(attributes: WebGLAttributeBuffers, renderAtomic: RenderAtomic)
{
    const vertexNum = ((attributelist) =>
    {
        for (const attr in attributelist)
        {
            // eslint-disable-next-line no-prototype-builtins
            if (attributelist.hasOwnProperty(attr))
            {
                const attribute = attributes.get(attributelist[attr]);

                return attribute.count;
            }
        }

        return 0;
    })(renderAtomic.attributes);

    return vertexNum;
}