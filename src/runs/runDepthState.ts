import { ICompareFunction, IDepthStencilState } from "@feng3d/render-api";
import { IGLCompareFunction } from "../data/IGLDepthStencilState";

export function runDepthState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
{
    if (depthStencil && (depthStencil.depthWriteEnabled || depthStencil.depthCompare !== "always"))
    {
        const depthCompare: IGLCompareFunction = getIGLCompareFunction(depthStencil.depthCompare ?? 'less');
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

function getIGLCompareFunction(depthCompare: ICompareFunction)
{
    const glDepthCompare: IGLCompareFunction = depthCompareMap[depthCompare];

    console.assert(!!glDepthCompare, `接收到错误值，请从 ${Object.keys(depthCompareMap).toString()} 中取值！`);
    
    return glDepthCompare;
}

const depthCompareMap: { [key: string]: IGLCompareFunction } = {
    "never": "NEVER",
    "less": "LESS",
    "equal": "EQUAL",
    "less-equal": "LEQUAL",
    "greater": "GREATER",
    "not-equal": "NOTEQUAL",
    "greater-equal": "GEQUAL",
    "always": "ALWAYS",
};