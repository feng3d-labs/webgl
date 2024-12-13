import { IStencilFaceState, IGLStencilState } from "../data/IGLDepthStencilState";

const defaultStencilFaceState: IStencilFaceState = { stencilFunc: "ALWAYS", stencilFuncRef: 0, stencilFuncMask: 0xFFFFFFFF, stencilOpFail: "KEEP", stencilOpZFail: "KEEP", stencilOpZPass: "KEEP", stencilMask: 0xFFFFFFFF };
export const defaultStencilState: IGLStencilState = { useStencil: false, stencilFront: defaultStencilFaceState, stencilBack: defaultStencilFaceState };

export function runStencilState(gl: WebGLRenderingContext, stencil: IGLStencilState)
{
    //
    const {
        useStencil, stencilFront, stencilBack,
    } = { ...defaultStencilState, ...stencil };

    if (useStencil)
    {
        gl.enable(gl.STENCIL_TEST);
        {
            const { stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask } = { ...defaultStencilFaceState, ...stencilFront };
            gl.stencilFuncSeparate(gl.FRONT, gl[stencilFunc], stencilFuncRef, stencilFuncMask);
            gl.stencilOpSeparate(gl.FRONT, gl[stencilOpFail], gl[stencilOpZFail], gl[stencilOpZPass]);
            gl.stencilMaskSeparate(gl.FRONT, stencilMask);
        }
        {
            const { stencilFunc, stencilFuncRef, stencilFuncMask, stencilOpFail, stencilOpZFail, stencilOpZPass, stencilMask } = { ...defaultStencilFaceState, ...stencilBack };
            gl.stencilFuncSeparate(gl.BACK, gl[stencilFunc], stencilFuncRef, stencilFuncMask);
            gl.stencilOpSeparate(gl.BACK, gl[stencilOpFail], gl[stencilOpZFail], gl[stencilOpZPass]);
            gl.stencilMaskSeparate(gl.BACK, stencilMask);
        }
    }
    else
    {
        gl.disable(gl.STENCIL_TEST);
    }
}