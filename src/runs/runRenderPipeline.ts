import { IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";
import { defaultDepthStencilState, runDepthStencilState } from "./runDepthStencilState";
import { defaultPrimitiveState, runPrimitiveState } from "./runPrimitiveState";
import { defaultFragmentState, defaultVertexState, runProgram } from "./runProgram";

export function runRenderPipeline(gl: WebGLRenderingContext, renderPipeline: IWebGLRenderPipeline)
{
    runProgram(gl, renderPipeline.vertex, renderPipeline.fragment);

    runPrimitiveState(gl, renderPipeline.primitive);

    runDepthStencilState(gl, renderPipeline.depthStencil);
}

export const defaultRenderPipeline: IWebGLRenderPipeline = Object.freeze({
    vertex: defaultVertexState, fragment: defaultFragmentState, primitive: defaultPrimitiveState,
    depthStencil: defaultDepthStencilState
});