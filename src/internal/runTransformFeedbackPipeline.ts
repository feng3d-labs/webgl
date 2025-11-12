import { TransformFeedbackPipeline } from "../data/TransformFeedbackPass";
import { getGLProgram } from "../caches/getGLProgram";

export function runTransformFeedbackPipeline(gl: WebGLRenderingContext, renderPipeline: TransformFeedbackPipeline)
{
    const program = getGLProgram(gl, renderPipeline);
    gl.useProgram(program);
}

