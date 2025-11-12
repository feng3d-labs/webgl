import { DepthStencilState, RenderPipeline } from "@feng3d/render-api";
import { runProgram } from "./runProgram";
import { runDepthState } from "./runDepthState";
import { runStencilState } from "./runStencilState";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: RenderPipeline)
{
    runProgram(gl, renderPipeline);

    runDepthState(gl, renderPipeline.depthStencil);
    runStencilState(gl, renderPipeline.depthStencil);
}

