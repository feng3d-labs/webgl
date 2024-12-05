import { IGLTransformFeedback } from "../data/IGLTransformFeedback";
import { getIGLVertexBuffer } from "../runs/getIGLBuffer";
import { getWebGLBuffer } from "./getWebGLBuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _transforms: Map<IGLTransformFeedback, WebGLTransformFeedback>;
    }
}

export function getWebGLTransformFeedback(gl: WebGLRenderingContext, transformFeedback: IGLTransformFeedback)
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
            const buffer = getIGLVertexBuffer(data, "STREAM_COPY");
            const webGLBuffer = getWebGLBuffer(gl, buffer);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, webGLBuffer);
        });

        // 移除可能绑定在GL上的回写数据缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    return webGLTransformFeedback;
}

export function deleteTransformFeedback(gl: WebGLRenderingContext, transformFeedback: IGLTransformFeedback)
{
    const webGLTransformFeedback = gl._transforms.get(transformFeedback);
    if (!webGLTransformFeedback) return;

    gl._transforms.delete(transformFeedback);
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.deleteTransformFeedback(webGLTransformFeedback);
    }
}
