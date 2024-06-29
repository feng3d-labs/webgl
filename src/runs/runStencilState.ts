import { IStencilFaceState, IStencilState } from "../data/IDepthStencilState";

const defaultStencilFaceState: IStencilFaceState = { stencilFunc: "ALWAYS", stencilFuncRef: 0, stencilFuncMask: 0b11111111, stencilOpFail: "KEEP", stencilOpZFail: "KEEP", stencilOpZPass: "KEEP", stencilMask: 0b11111111 };
export const defaultStencilState: IStencilState = { useStencil: false, stencilFront: defaultStencilFaceState, stencilBack: defaultStencilFaceState };

export function runStencilState(gl: WebGLRenderingContext, stencil: IStencilState)
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