import { IDepthBias, IDepthState } from "../data/IDepthStencilState";

export const defaultDepthState: IDepthState = { depthtest: true, depthWriteEnabled: true, depthCompare: "LESS" };

export function runDepthState(gl: WebGLRenderingContext, depth: IDepthState)
{
    const { depthtest, depthCompare, depthWriteEnabled, depthBias } = { ...defaultDepthState, ...depth };

    if (depthtest)
    {
        gl.enable(gl.DEPTH_TEST);
        //
        gl.depthFunc(gl[depthCompare]);
        gl.depthMask(depthWriteEnabled);

        //
        if (depthBias)
        {
            const { factor, units } = depthBias;

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
