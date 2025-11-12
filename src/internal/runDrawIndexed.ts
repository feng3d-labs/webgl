import { DrawIndexed, IndicesDataTypes } from "@feng3d/render-api";
import { getGLDrawMode, GLDrawMode } from "../caches/getGLDrawMode";
import { DrawElementType } from "../data/polyfills/Buffer";

export function runDrawIndexed(gl: WebGLRenderingContext, drawMode: GLDrawMode, indices: IndicesDataTypes, drawIndexed: DrawIndexed)
{
    const type: DrawElementType = indices.BYTES_PER_ELEMENT === 2 ? "UNSIGNED_SHORT" : "UNSIGNED_INT";
    //
    const indexCount = drawIndexed.indexCount;
    const firstIndex = drawIndexed.firstIndex || 0;
    const instanceCount = drawIndexed.instanceCount || 1;
    //
    const offset = firstIndex * indices.BYTES_PER_ELEMENT;

    //
    if (instanceCount > 1)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.drawElementsInstanced(gl[drawMode], indexCount, gl[type], offset, instanceCount);
        }
        else
        {
            const extension = gl.getExtension("ANGLE_instanced_arrays");
            extension.drawElementsInstancedANGLE(gl[drawMode], indexCount, gl[type], offset, instanceCount);
        }
    }
    else
    {
        gl.drawElements(gl[drawMode], indexCount, gl[type], offset);
    }
}

