import { IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";
import { runDepthStencilState } from "./runDepthStencilState";
import { runPrimitiveState } from "./runPrimitiveState";
import { runProgram } from "./runProgram";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    runProgram(gl, renderPipeline.vertex, renderPipeline.fragment);

    runPrimitiveState(gl, renderPipeline.primitive);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}
