import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { getElementWebGLBuffer } from "../caches/getWebGLElementBuffer";
import { IRenderObject } from "../data/IRenderObject";
import { runIndexBuffer } from "../runs/runIndexBuffer";
import { runVertexAttribute } from "../runs/runVertexAttribute";

export function setup(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    setupVertexAttributes(gl, renderAtomic);

    runIndexBuffer(gl, renderAtomic.index);
}

/**
 * 设置顶点属性。
 *
 * @param renderAtomic 渲染原子。
 */
function setupVertexAttributes(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    const shaderResult = getCompileShaderResult(gl, renderAtomic.pipeline.vertex.code, renderAtomic.pipeline.fragment.code);

    for (const name in shaderResult.attributes)
    {
        const activeInfo = shaderResult.attributes[name];
        const location = activeInfo.location;
        // 处理 WebGL 内置属性 gl_VertexID 等
        if (location < 0)
        {
            continue;
        }

        const attribute = renderAtomic.vertices[name];

        runVertexAttribute(gl, location, attribute);
    }
}

