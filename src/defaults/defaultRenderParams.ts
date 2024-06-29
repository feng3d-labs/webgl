import { RenderParams } from "../data/RenderParams";

export const defaultRenderParams: RenderParams = {
    useScissor: false,
    usePolygonOffset: false,
    polygonOffsetFactor: 0,
    polygonOffsetUnits: 0,
    useStencil: false,
    stencilFunc: "ALWAYS",
    stencilFuncRef: 0,
    stencilFuncMask: 1,
    stencilOpFail: "KEEP",
    stencilOpZFail: "KEEP",
    stencilOpZPass: "KEEP",
    stencilMask: 1,
};