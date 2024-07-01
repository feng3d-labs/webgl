import { IRenderPipeline } from "../data/IRenderPipeline";
import { defaultDepthStencilState, runDepthStencilState } from "./runDepthStencilState";
import { defaultPrimitiveState, runPrimitiveState } from "./runPrimitiveState";
import { defaultFragmentState, defaultVertexState, runProgram } from "./runProgram";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IRenderPipeline)
{
    runProgram(gl, renderPipeline);

    runPrimitiveState(gl, renderPipeline.primitive);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}

export const defaultRenderPipeline: IRenderPipeline = Object.freeze({
    vertex: defaultVertexState, fragment: defaultFragmentState, primitive: defaultPrimitiveState,
    depthStencil: defaultDepthStencilState
});