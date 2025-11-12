import { DepthStencilState } from "@feng3d/render-api";
import { getIGLStencilFunc, getIGLStencilOp } from "../runs/runStencilState";

export function runStencilState(gl: WebGLRenderingContext, depthStencil?: DepthStencilState)
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
            const func = getIGLStencilFunc(stencilFront.compare ?? "always");
            const fail = getIGLStencilOp(stencilFront.failOp);
            const zfail = getIGLStencilOp(stencilFront.depthFailOp);
            const zpass = getIGLStencilOp(stencilFront.passOp);
            //
            gl.stencilFuncSeparate(gl.FRONT, gl[func], ref, readMask);
            gl.stencilOpSeparate(gl.FRONT, gl[fail], gl[zfail], gl[zpass]);
            gl.stencilMaskSeparate(gl.FRONT, writeMask);
        }
        if (stencilBack)
        {
            const func = getIGLStencilFunc(stencilBack.compare ?? "always");
            const fail = getIGLStencilOp(stencilBack.failOp);
            const zfail = getIGLStencilOp(stencilBack.depthFailOp);
            const zpass = getIGLStencilOp(stencilBack.passOp);
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

