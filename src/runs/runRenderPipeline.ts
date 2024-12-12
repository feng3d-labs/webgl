import { IRenderPipeline } from "@feng3d/render-api";
import { runDepthStencilState } from "./runDepthStencilState";
import { runPrimitiveState } from "./runPrimitiveState";
import { runProgram } from "./runProgram";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IRenderPipeline)
{
    runProgram(gl, renderPipeline);

    runPrimitiveState(gl, renderPipeline?.primitive);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}
