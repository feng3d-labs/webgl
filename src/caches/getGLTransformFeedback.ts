import { Buffer } from '@feng3d/render-api';
import { TransformFeedback } from '../data/TransformFeedbackPass';
import { getGLBuffer } from './getGLBuffer';

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
            const buffer = Buffer.getBuffer(data.buffer);

            const webGLBuffer = getGLBuffer(gl, buffer, 'TRANSFORM_FEEDBACK_BUFFER', 'STREAM_COPY');
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
