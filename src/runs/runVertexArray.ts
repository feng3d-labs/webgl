import { getProgram } from "../caches/getProgram";
import { IGLRenderPipeline } from "../data/IGLRenderPipeline";
import { IGLVertexArrayObject } from "../data/IGLVertexArrayObject";
import { runIndexBuffer } from "./runIndexBuffer";
import { runVertexAttribute } from "./runVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _vertexArrays: Map<IGLVertexArrayObject, WebGLVertexArrayObject>;
    }
}

/**
 * 执行设置或者上传渲染对象的顶点以及索引数据。
 */
export function runVertexArray(gl: WebGLRenderingContext, pipeline: IGLRenderPipeline, vertexArray: IGLVertexArrayObject)
{
    if (!vertexArray) return;

    let webGLVertexArrayObject: WebGLVertexArrayObject;
    if (gl instanceof WebGL2RenderingContext)
    {
        webGLVertexArrayObject = gl._vertexArrays.get(vertexArray);
        if (webGLVertexArrayObject)
        {
            gl.bindVertexArray(webGLVertexArrayObject);

            return;
        }

        webGLVertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(webGLVertexArrayObject);
        gl._vertexArrays.set(vertexArray, webGLVertexArrayObject);
    }

    //
    const { vertices, indices } = vertexArray;

    const shaderResult = getProgram(gl, pipeline);

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

export function deleteVertexArray(gl: WebGLRenderingContext, vertexArray: IGLVertexArrayObject)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLVertexArrayObject = gl._vertexArrays.get(vertexArray);
        gl._vertexArrays.delete(vertexArray);
        gl.deleteVertexArray(webGLVertexArrayObject);
    }
}