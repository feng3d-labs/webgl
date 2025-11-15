import { DrawIndexed, IndicesDataTypes } from '@feng3d/render-api';
import { GLDrawMode } from '../../caches/getGLDrawMode';

export function runDrawIndexed(gl: WebGLRenderingContext, drawMode: GLDrawMode, indices: IndicesDataTypes, drawIndexed: DrawIndexed)
{
    const type = indices.BYTES_PER_ELEMENT === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
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
            gl.drawElementsInstanced(gl[drawMode], indexCount, type, offset, instanceCount);
        }
        else
        {
            const extension = gl.getExtension('ANGLE_instanced_arrays');
            extension.drawElementsInstancedANGLE(gl[drawMode], indexCount, type, offset, instanceCount);
        }
    }
    else
    {
        gl.drawElements(gl[drawMode], indexCount, type, offset);
    }
}
