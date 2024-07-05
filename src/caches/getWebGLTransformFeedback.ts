import { ITransformFeedback } from "../data/ITransformFeedback";
import { getWebGLBuffer } from "./getWebGLBuffer";

declare global
{
    interface WebGLRenderingContext
    {
        _transforms: Map<ITransformFeedback, WebGLTransformFeedback>;
    }
}

export function getWebGLTransformFeedback(gl: WebGLRenderingContext, transformFeedback: ITransformFeedback)
{
    let webGLTransformFeedback = gl._transforms.get(transformFeedback);
    if (webGLTransformFeedback) return webGLTransformFeedback;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLTransformFeedback = gl.createTransformFeedback();
        gl._transforms.set(transformFeedback, webGLTransformFeedback);

        const { index, buffer } = transformFeedback;
        const webGLBuffer = getWebGLBuffer(gl, buffer);

        //
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webGLTransformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, webGLBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    return webGLTransformFeedback;
}

export function deleteTransformFeedback(gl: WebGLRenderingContext, transformFeedback: ITransformFeedback)
{
    const webGLTransformFeedback = gl._transforms.get(transformFeedback);
    if (!webGLTransformFeedback) return;

    gl._transforms.delete(transformFeedback);
    if (gl instanceof WebGL2RenderingContext)
    {
        gl.deleteTransformFeedback(webGLTransformFeedback);
    }
}
