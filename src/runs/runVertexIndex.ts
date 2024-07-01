import { getProgram } from "../caches/getProgram";
import { IRenderPipeline } from "../data/IRenderPipeline";
import { IVertexArrayObject } from "../data/IVertexArrayObject";
import { runIndexBuffer } from "./runIndexBuffer";
import { runVertexAttribute } from "./runVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _vertexArrayObjects: WeakMap<IVertexArrayObject, WebGLVertexArrayObject>;
    }
}

/**
 * 执行设置或者上传渲染对象的顶点以及索引数据。
 */
export function runVertexArray(gl: WebGLRenderingContext, pipeline: IRenderPipeline, vertexArray: IVertexArrayObject)
{
    let webGLVertexArrayObject: WebGLVertexArrayObject;
    if (gl instanceof WebGL2RenderingContext)
    {
        webGLVertexArrayObject = gl._vertexArrayObjects.get(vertexArray);
        if (webGLVertexArrayObject)
        {
            gl.bindVertexArray(webGLVertexArrayObject);

            return;
        }

        webGLVertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(webGLVertexArrayObject);
        gl._vertexArrayObjects.set(vertexArray, webGLVertexArrayObject);
    }

    //
    const { vertices, index } = vertexArray;

    const shaderResult = getProgram(gl, pipeline);

    for (const name in shaderResult.attributes)
    {
        const activeInfo = shaderResult.attributes[name];
        const location = activeInfo.location;
        // 处理 WebGL 内置属性 gl_VertexID 等
        if (location < 0)
        {
            continue;
        }

        const attribute = vertices[name];

        runVertexAttribute(gl, location, attribute);
    }

    runIndexBuffer(gl, index);
}

export function deleteVertexArray(gl: WebGLRenderingContext, vertexArray: IVertexArrayObject)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        const webGLVertexArrayObject = gl._vertexArrayObjects.get(vertexArray);
        gl._vertexArrayObjects.delete(vertexArray);
        gl.deleteVertexArray(webGLVertexArrayObject);
    }
}