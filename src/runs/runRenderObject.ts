import { IRenderObject } from "../data/IRenderObject";
import { runDrawCall } from "./runDrawCall";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    runViewPort(gl, renderObject.viewport);

    runScissor(gl, renderObject.scissor);

    runRenderPipeline(gl, renderObject.pipeline);

    runVertexArray(gl, renderObject.pipeline, renderObject.vertexArray);

    runUniforms(gl, renderObject);

    runDrawCall(gl, renderObject);
}

