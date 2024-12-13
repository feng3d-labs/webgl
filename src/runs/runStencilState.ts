import { ICompareFunction, IDepthStencilState, IStencilOperation } from "@feng3d/render-api";
import { IGLStencilFunc, IGLStencilOp } from "../data/IGLDepthStencilState";

export function runStencilState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
{
    const { stencilFront, stencilBack } = { ...depthStencil };
    //
    if (stencilFront || stencilBack)
    {
        const ref: number = depthStencil.stencilReference ?? 0;
        const readMask = depthStencil.stencilReadMask ?? 0xFFFFFFFF;
        const writeMask = depthStencil.stencilWriteMask ?? 0xFFFFFFFF;

        gl.enable(gl.STENCIL_TEST);

        if (stencilFront)
        {
            const func: IGLStencilFunc = getIGLStencilFunc(stencilFront.compare ?? "always");
            const fail: IGLStencilOp = getIGLStencilOp(stencilFront.failOp);
            const zfail: IGLStencilOp = getIGLStencilOp(stencilFront.depthFailOp);
            const zpass: IGLStencilOp = getIGLStencilOp(stencilFront.passOp);
            //
            gl.stencilFuncSeparate(gl.FRONT, gl[func], ref, readMask);
            gl.stencilOpSeparate(gl.FRONT, gl[fail], gl[zfail], gl[zpass]);
            gl.stencilMaskSeparate(gl.FRONT, writeMask);
        }
        if (stencilBack)
        {
            const func: IGLStencilFunc = getIGLStencilFunc(stencilBack.compare ?? "always");
            const fail: IGLStencilOp = getIGLStencilOp(stencilBack.failOp);
            const zfail: IGLStencilOp = getIGLStencilOp(stencilBack.depthFailOp);
            const zpass: IGLStencilOp = getIGLStencilOp(stencilBack.passOp);
            //
            gl.stencilFuncSeparate(gl.BACK, gl[func], ref, readMask);
            gl.stencilOpSeparate(gl.BACK, gl[fail], gl[zfail], gl[zpass]);
            gl.stencilMaskSeparate(gl.BACK, writeMask);
        }
    }
    else
    {
        gl.disable(gl.STENCIL_TEST);
    }
}

function getIGLStencilFunc(compare: ICompareFunction)
{
    const stencilFunc: IGLStencilFunc = compareMap[compare];

    return stencilFunc;
}
const compareMap: { [key: string]: IGLStencilFunc } = {
    "never": "NEVER",
    "less": "LESS",
    "equal": "EQUAL",
    "less-equal": "LEQUAL",
    "greater": "GREATER",
    "not-equal": "NOTEQUAL",
    "greater-equal": "GEQUAL",
    "always": "ALWAYS",
};

function getIGLStencilOp(stencilOperation?: IStencilOperation)
{
    const glStencilOp: IGLStencilOp = stencilOperationMap[stencilOperation];

    return glStencilOp;
}
const stencilOperationMap: { [key: string]: IGLStencilOp } = {
    "keep": "KEEP",
    "zero": "ZERO",
    "replace": "REPLACE",
    "invert": "INVERT",
    "increment-clamp": "INCR",
    "decrement-clamp": "DECR",
    "increment-wrap": "INCR_WRAP",
    "decrement-wrap": "DECR_WRAP",
};