import { DepthStencilState } from '@feng3d/render-api';
import { getGLCompareFunction } from '../runs/getGLCompareFunction';

export function runDepthState(gl: WebGLRenderingContext, depthStencil?: DepthStencilState)
{
    if (depthStencil && (depthStencil.depthWriteEnabled || depthStencil.depthCompare !== 'always'))
    {
        const depthCompare = getGLCompareFunction(depthStencil.depthCompare ?? 'less');
        const depthWriteEnabled = depthStencil.depthWriteEnabled ?? true;
        //
        gl.enable(gl.DEPTH_TEST);
        //
        gl.depthFunc(gl[depthCompare]);
        gl.depthMask(depthWriteEnabled);

        //
        if (depthStencil.depthBias || depthStencil.depthBiasSlopeScale)
        {
            const factor = depthStencil.depthBiasSlopeScale ?? 0;
            const units = depthStencil.depthBias ?? 0;
            //
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(factor, units);
        }
        else
        {
            gl.disable(gl.POLYGON_OFFSET_FILL);
        }
    }
    else
    {
        gl.disable(gl.DEPTH_TEST);
    }
}

