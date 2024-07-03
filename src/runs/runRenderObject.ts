import { IRenderObject } from "../data/IRenderObject";
import { runDrawCall } from "./runDrawCall";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const { viewport, scissor, pipeline, vertexArray, uniforms } = renderObject;

    runViewPort(gl, viewport);

    runScissor(gl, scissor);

    runRenderPipeline(gl, pipeline);

    runVertexArray(gl, pipeline, vertexArray);

    runUniforms(gl, pipeline, uniforms);

    runDrawCall(gl, renderObject);
}

