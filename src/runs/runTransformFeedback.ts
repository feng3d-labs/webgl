import { getGLTransformFeedback } from "../caches/getGLTransformFeedback";
import { IGLDrawMode } from "../data/IGLPrimitiveState";
import { IGLTransformFeedback } from "../data/IGLTransformFeedback";

export function runTransformFeedback(gl: WebGLRenderingContext, transformFeedback: IGLTransformFeedback, topology: IGLDrawMode)
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

export function endTransformFeedback(gl: WebGLRenderingContext, transformFeedback: IGLTransformFeedback)
{
    //
    if (transformFeedback)
    {
        if (gl instanceof WebGL2RenderingContext)
        {
            gl.endTransformFeedback();
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        }
    }
}
