import { IDepthStencilState } from "@feng3d/render-api";
import { runDepthState } from "./runDepthState";
import { runStencilState } from "./runStencilState";

export function runDepthStencilState(gl: WebGLRenderingContext, depthStencil?: IDepthStencilState)
{
    runDepthState(gl, depthStencil);
    runStencilState(gl, depthStencil);
}
