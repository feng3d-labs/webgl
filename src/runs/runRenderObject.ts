import { IRenderObject } from "../data/IRenderObject";
import { runDrawCall } from "./runDrawCall";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runVertexIndex } from "./runVertexIndex";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    runViewPort(gl, renderObject.viewport);

    runScissor(gl, renderObject.scissor);

    runRenderPipeline(gl, renderObject.pipeline);

    runVertexIndex(gl, renderObject);

    runUniforms(gl, renderObject);

    runDrawCall(gl, renderObject);
}

