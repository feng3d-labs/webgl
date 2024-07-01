import { getProgram } from "../caches/getProgram";
import { IRenderObject } from "../data/IRenderObject";
import { runIndexBuffer } from "./runIndexBuffer";
import { runVertexAttribute } from "./runVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _vertexArrayObjects: WeakMap<IRenderObject, WebGLVertexArrayObject>;
    }
}

/**
 * 执行设置或者上传渲染对象的顶点以及索引数据。
 */
export function runVertexArrayObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    // const vertexArray = getVertexArrayObject(gl, renderObject);

    let vertexArray: WebGLVertexArrayObject;
    if (gl instanceof WebGL2RenderingContext)
    {
        vertexArray = gl._vertexArrayObjects.get(renderObject);
        if (vertexArray)
        {
            gl.bindVertexArray(vertexArray);

            return;
        }

        vertexArray = gl.createVertexArray();
        gl.bindVertexArray(vertexArray);
        gl._vertexArrayObjects.set(renderObject, vertexArray);
    }

    const { pipeline, vertices, index } = renderObject;

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

// export function runVertexIndex(gl: WebGLRenderingContext, renderObject: IRenderObject, vertexArray?: WebGLVertexArrayObject)
// {
//     const { pipeline, vertices, index } = renderObject;

//     const shaderResult = getProgram(gl, pipeline);

//     for (const name in shaderResult.attributes)
//     {
//         const activeInfo = shaderResult.attributes[name];
//         const location = activeInfo.location;
//         // 处理 WebGL 内置属性 gl_VertexID 等
//         if (location < 0)
//         {
//             continue;
//         }

//         const attribute = vertices[name];

//         runVertexAttribute(gl, location, attribute);
//     }

//     runIndexBuffer(gl, index);
// }