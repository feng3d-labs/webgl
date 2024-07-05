import { getWebGLTransformFeedback } from "../caches/getWebGLTransformFeedback";
import { IDrawMode } from "../data/IPrimitiveState";
import { ITransformFeedback } from "../data/ITransformFeedback";

export function runTransformFeedback(gl: WebGLRenderingContext, transformFeedback: ITransformFeedback, topology: IDrawMode)
{
    if (gl instanceof WebGL2RenderingContext)
    {
        if (transformFeedback)
        {
            const webGLTransformFeedback = getWebGLTransformFeedback(gl, transformFeedback);

            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webGLTransformFeedback);

            gl.beginTransformFeedback(gl[topology]);
        }
        else
        {
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        }
    }
    else
    {
        console.log(`WebGL1 不支持顶点着色器回写数据功能！`);
    }
}

export function endTransformFeedback(gl: WebGLRenderingContext, transformFeedback: ITransformFeedback)
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
