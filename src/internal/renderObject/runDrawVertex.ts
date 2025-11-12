import { DrawVertex } from "@feng3d/render-api";
import { GLDrawMode } from "../../caches/getGLDrawMode";

export function runDrawVertex(gl: WebGLRenderingContext, drawMode: GLDrawMode, drawArrays: DrawVertex)
{
    //
    const vertexCount = drawArrays.vertexCount;
    const firstVertex = drawArrays.firstVertex || 0;
    const instanceCount = drawArrays.instanceCount || 1;

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

