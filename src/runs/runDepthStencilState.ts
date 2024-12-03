import { IGLDepthStencilState } from "../data/IGLDepthStencilState";
import { defaultDepthState, runDepthState } from "./runDepthState";
import { defaultStencilState, runStencilState } from "./runStencilState";

export const defaultDepthStencilState: IGLDepthStencilState = Object.freeze({ depth: defaultDepthState, stencil: defaultStencilState });

export function runDepthStencilState(gl: WebGLRenderingContext, depthStencil?: IGLDepthStencilState)
{
    runDepthState(gl, depthStencil?.depth || defaultDepthStencilState.depth);
    runStencilState(gl, depthStencil?.stencil || defaultDepthStencilState.stencil);
}
