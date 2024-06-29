import { IDepthBias, IDepthState } from "../data/IDepthStencilState";

const defaultDepthBias: IDepthBias = { units: 0, factor: 0 };
export const defaultDepthState: IDepthState = { depthtest: true, depthWriteEnabled: true, depthCompare: "LESS", depthBias: defaultDepthBias };

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
            const { factor, units } = { ...defaultDepthBias, ...depthBias };

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
