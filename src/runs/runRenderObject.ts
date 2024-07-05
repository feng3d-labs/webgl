import { getWebGLBuffer } from "../caches/getWebGLBuffer";
import { IDrawMode } from "../data/IPrimitiveState";
import { IRenderObject } from "../data/IRenderObject";
import { ITransformFeedback } from "../data/ITransformFeedback";
import { runDrawCall } from "./runDrawCall";
import { defaultPrimitiveState } from "./runPrimitiveState";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const { viewport, scissor, pipeline, vertexArray, uniforms, transformFeedback } = renderObject;

    const topology = pipeline.primitive?.topology || defaultPrimitiveState.topology;

    runViewPort(gl, viewport);

    runScissor(gl, scissor);

    runRenderPipeline(gl, pipeline);

    runVertexArray(gl, pipeline, vertexArray);

    runUniforms(gl, pipeline, uniforms);

    beginTransformFeedback(gl, transformFeedback, topology);

    runDrawCall(gl, renderObject);

    endTransformFeedback(gl, transformFeedback);
}

export function beginTransformFeedback(gl: WebGLRenderingContext, transformFeedback: ITransformFeedback, topology: IDrawMode)
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

export function getWebGLTransformFeedback(gl: WebGLRenderingContext, transformFeedback: ITransformFeedback)
{
    let webGLTransformFeedback = _transforms.get(transformFeedback);
    if (webGLTransformFeedback) return webGLTransformFeedback;

    if (gl instanceof WebGL2RenderingContext)
    {
        webGLTransformFeedback = gl.createTransformFeedback();
        _transforms.set(transformFeedback, webGLTransformFeedback);

        const { index, buffer } = transformFeedback;
        const webGLBuffer = getWebGLBuffer(gl, buffer);

        //
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, webGLTransformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, webGLBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    return webGLTransformFeedback;
}

const _transforms = new Map<ITransformFeedback, WebGLTransformFeedback>();