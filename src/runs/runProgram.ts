import { getProgram } from "../caches/getProgram";
import { IFragmentState, IVertexState, IRenderPipeline } from "../data/IRenderPipeline";
import { defaultColorTargetStates, runColorTargetStates } from "./runColorTargetStates";

export function runProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
{
    const program = getProgram(gl, pipeline);
    gl.useProgram(program);

    //
    runColorTargetStates(gl, pipeline.fragment.targets);
}

export const defaultVertexState: IVertexState = Object.freeze({ code: "" });
export const defaultFragmentState: IFragmentState = Object.freeze({ code: "", targets: defaultColorTargetStates });