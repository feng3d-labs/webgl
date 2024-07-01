import { IRenderObject } from "../data/IRenderObject";

export function getVertexArrayObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
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
        gl._vertexArrayObjects.set(renderObject, vertexArray);
        gl.bindVertexArray(vertexArray);
    }

    return vertexArray;
}