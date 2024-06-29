import { getRenderParams } from "../caches/getRenderParams";
import { RenderParams } from "../data/RenderParams";

export function runRenderParams(gl: WebGLRenderingContext, renderParams: RenderParams)
{
    renderParams = getRenderParams(renderParams);

    const {
        useStencil, stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask,
    } = renderParams;

    if (useStencil)
    {
        gl.enable(gl.STENCIL_TEST);
        gl.stencilFunc(gl[stencilFunc], stencilFuncRef, stencilFuncMask);
        gl.stencilOp(gl[stencilOpFail], gl[stencilOpZFail], gl[stencilOpZPass]);
        gl.stencilMask(stencilMask);
    }
    else
    {
        gl.disable(gl.STENCIL_TEST);
    }
}