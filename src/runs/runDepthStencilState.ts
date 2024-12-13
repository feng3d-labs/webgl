import { IDepthStencilState } from "@feng3d/render-api";
import { defaultDepthState, runDepthState } from "./runDepthState";
import { defaultStencilState, runStencilState } from "./runStencilState";

export const defaultDepthStencilState: IDepthStencilState = Object.freeze({ depth: defaultDepthState, stencil: defaultStencilState });

export function runDepthStencilState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
{
    runDepthState(gl, depthStencil?.depth);
    runStencilState(gl, depthStencil?.stencil || defaultDepthStencilState.stencil);
}
