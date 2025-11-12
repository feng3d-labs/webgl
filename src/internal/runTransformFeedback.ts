import { TransformFeedback } from '../data/TransformFeedbackPass';
import { getGLTransformFeedback } from '../caches/getGLTransformFeedback';
import { GLDrawMode } from '../caches/getGLDrawMode';

export function runTransformFeedback(gl: WebGLRenderingContext, transformFeedback: TransformFeedback, topology: GLDrawMode)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        if (transformFeedback)
        {
            const webGLTransformFeedback = getGLTransformFeedback(gl, transformFeedback);

            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webGLTransformFeedback);

            gl.beginTransformFeedback(gl[topology]);
        }
        else
        {
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        }
    }
    else if (transformFeedback)
    {
        console.log(`WebGL1 不支持顶点着色器回写数据功能！`);
    }
}

