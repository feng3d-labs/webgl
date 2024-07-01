import { getWebGLProgram } from "../caches/getWebGLProgram";
import { IFragmentState, IVertexState, IWebGLRenderPipeline } from "../data/IWebGLRenderPipeline";
import { defaultColorTargetStates, runColorTargetStates } from "./runColorTargetStates";

export function runProgram(gl: WebGLRenderingContext, pipeline: IWebGLRenderPipeline)
{
    const program = getWebGLProgram(gl, pipeline);
    gl.useProgram(program);

    //
    runColorTargetStates(gl, pipeline.fragment.targets);
}

export const defaultVertexState: IVertexState = Object.freeze({ code: "" });
export const defaultFragmentState: IFragmentState = Object.freeze({ code: "", targets: defaultColorTargetStates });