import { IIndicesDataTypes, IRenderPipeline, IVertexAttributes } from "@feng3d/render-api";
import { getGLProgram } from "../caches/getGLProgram";
import { ChainMap } from "../utils/ChainMap";
import { runIndexBuffer } from "./runIndexBuffer";
import { runVertexAttribute } from "./runVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _vertexArrays: ChainMap<[IRenderPipeline, IVertexAttributes, IIndicesDataTypes], WebGLVertexArrayObject>;
    }
}

/**
 * 执行设置或者上传渲染对象的顶点以及索引数据。
 */
export function runVertexArray(gl: WebGLRenderingContext, pipeline: IRenderPipeline, vertices: IVertexAttributes, indices: IIndicesDataTypes)
{
    if (!vertices && !indices) return;

    let webGLVertexArrayObject: WebGLVertexArrayObject;
    if (gl instanceof WebGL2RenderingContext)
    {
        webGLVertexArrayObject = gl._vertexArrays.get([pipeline, vertices, indices]);
        if (webGLVertexArrayObject)
        {
            gl.bindVertexArray(webGLVertexArrayObject);

            return;
        }

        webGLVertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(webGLVertexArrayObject);
        gl._vertexArrays.set([pipeline, vertices, indices], webGLVertexArrayObject);
    }

    const shaderResult = getGLProgram(gl, pipeline);

    //
    shaderResult.attributes.forEach((activeInfo) =>
    {
        const { name, location } = activeInfo;
        // 处理 WebGL 内置属性 gl_VertexID 等
        if (location < 0) return;

        const attribute = vertices[name];
        if (!attribute)
        {
            console.error(`缺少顶点 ${name} 数据！`);
        }

        runVertexAttribute(gl, location, attribute);
    });

    runIndexBuffer(gl, indices);
}
