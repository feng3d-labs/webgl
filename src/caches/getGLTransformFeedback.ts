import { TransformFeedback } from "../data/TransformFeedbackPass";
import { getIGLBuffer } from "../runs/getIGLBuffer";
import { getGLBuffer } from "./getGLBuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _transforms: Map<TransformFeedback, WebGLTransformFeedback>;
    }
}

export function getGLTransformFeedback(gl: WebGLRenderingContext, transformFeedback: TransformFeedback)
{
    let webGLTransformFeedback = gl._transforms.get(transformFeedback);
    if (webGLTransformFeedback) return webGLTransformFeedback;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLTransformFeedback = gl.createTransformFeedback();
        gl._transforms.set(transformFeedback, webGLTransformFeedback);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webGLTransformFeedback);
        transformFeedback.bindBuffers.forEach((v) =>
        {
            const { index, data } = v;
            const buffer = getIGLBuffer(data, "ARRAY_BUFFER", "STREAM_COPY");

            const webGLBuffer = getGLBuffer(gl, buffer);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, webGLBuffer);
        });

        // 移除可能绑定在GL上的回写数据缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    return webGLTransformFeedback;
}

export function deleteTransformFeedback(gl: WebGLRenderingContext, transformFeedback: TransformFeedback)
{
    const webGLTransformFeedback = gl._transforms.get(transformFeedback);
    if (!webGLTransformFeedback) return;

    gl._transforms.delete(transformFeedback);
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.deleteTransformFeedback(webGLTransformFeedback);
    }
}
