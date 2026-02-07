import { TransformFeedbackPipeline } from '@feng3d/render-api';
import { getGLProgram } from '../caches/getGLProgram';

export function runTransformFeedbackPipeline(gl: WebGLRenderingContext, renderPipeline: TransformFeedbackPipeline)
{
    const program = getGLProgram(gl, renderPipeline);

    gl.useProgram(program);
}

