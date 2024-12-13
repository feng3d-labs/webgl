import { IRenderPipeline } from "@feng3d/render-api";
import { getGLProgram } from "../caches/getGLProgram";
import { runColorTargetStates } from "./runColorTargetStates";

export function runProgram(gl: WebGLRenderingContext, pipeline: IRenderPipeline)
{
    const program = getGLProgram(gl, pipeline);
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
