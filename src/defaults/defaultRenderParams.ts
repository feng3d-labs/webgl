import { RenderParams } from "../data/RenderParams";

export const defaultRenderParams: RenderParams = {
    useStencil: false,
    stencilFunc: "ALWAYS",
    stencilFuncRef: 0,
    stencilFuncMask: 1,
    stencilOpFail: "KEEP",
    stencilOpZFail: "KEEP",
    stencilOpZPass: "KEEP",
    stencilMask: 1,
};