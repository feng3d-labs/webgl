import { getProgram } from "../caches/getProgram";
import { IFragmentState, IRenderPipeline, IVertexState } from "../data/IRenderPipeline";
import { defaultColorTargetStates, runColorTargetStates } from "./runColorTargetStates";

export function runProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
{
    const program = getProgram(gl, pipeline);
    gl.useProgram(program);

    //
    if (gl instanceof WebGL2RenderingContext)
    {
        if (pipeline.rasterizerDiscard)
        {
            gl.enable(gl.RASTERIZER_DISCARD);
        }
        else
        {
            gl.disable(gl.RASTERIZER_DISCARD);
        }
    }

    //
    runColorTargetStates(gl, pipeline.fragment.targets);
}

export const defaultVertexState: IVertexState = Object.freeze({ code: "" });
export const defaultFragmentState: IFragmentState = Object.freeze({ code: "", targets: defaultColorTargetStates });