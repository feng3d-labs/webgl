import { IGLRenderPipeline } from "../data/IGLRenderPipeline";
import { defaultDepthStencilState, runDepthStencilState } from "./runDepthStencilState";
import { defaultPrimitiveState, runPrimitiveState } from "./runPrimitiveState";
import { defaultFragmentState, defaultVertexState, runProgram } from "./runProgram";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IGLRenderPipeline)
{
    runProgram(gl, renderPipeline);

    runPrimitiveState(gl, renderPipeline?.primitive?.cullFace);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}

export const defaultRenderPipeline: IGLRenderPipeline = Object.freeze({
    vertex: defaultVertexState, fragment: defaultFragmentState, primitive: defaultPrimitiveState,
    depthStencil: defaultDepthStencilState
});