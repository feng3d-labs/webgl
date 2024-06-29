import { IDepthStencilState } from "../data/IDepthStencilState";
import { defaultDepthState, runDepthState } from "./runDepthState";
import { defaultStencilState, runStencilState } from "./runStencilState";

const defaultDepthStencilState: IDepthStencilState = { depth: defaultDepthState, stencil: defaultStencilState };

export function runDepthStencilState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
{
    runDepthState(gl, depthStencil?.depth || defaultDepthStencilState.depth);
    runStencilState(gl, depthStencil?.stencil || defaultDepthStencilState.stencil);
}
