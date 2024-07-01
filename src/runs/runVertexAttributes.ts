import { getProgram } from "../caches/getProgram";
import { IRenderObject } from "../data/IRenderObject";
import { runVertexAttribute } from "./runVertexAttribute";

/**
 * 设置顶点属性。
 *
 * @param renderAtomic 渲染原子。
 */
export function runVertexAttributes(gl: WebGLRenderingContext, renderAtomic: IRenderObject)
{
    const shaderResult = getProgram(gl, renderAtomic.pipeline);

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
