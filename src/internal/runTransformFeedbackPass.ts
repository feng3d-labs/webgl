import { TransformFeedbackPass } from '../data/TransformFeedbackPass';
import { runTransformFeedbackObject } from './runTransformFeedbackObject';

export function runTransformFeedbackPass(gl: WebGLRenderingContext, transformFeedbackPass: TransformFeedbackPass)
{
    // 执行变换反馈通道时关闭光栅化功能
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.enable(gl.RASTERIZER_DISCARD);
    }
    transformFeedbackPass.transformFeedbackObjects.forEach((transformFeedbackObject) =>
    {
        runTransformFeedbackObject(gl, transformFeedbackObject);
    });
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.disable(gl.RASTERIZER_DISCARD);
    }
}

