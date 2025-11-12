import { TransformFeedback } from '../data/TransformFeedbackPass';

export function endTransformFeedback(gl: WebGLRenderingContext, transformFeedback: TransformFeedback)
{
    //
    if (transformFeedback)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.endTransformFeedback();
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
        }
    }
}

