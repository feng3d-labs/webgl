import { IRenderObject } from "../data/IRenderObject";
import { runDrawCall } from "./runDrawCall";
import { runIndexBuffer } from "./runIndexBuffer";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runVertexArrayObject } from "./runVertexArrayObject";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    runViewPort(gl, renderObject.viewport);

    runScissor(gl, renderObject.scissor);

    runRenderPipeline(gl, renderObject.pipeline);

    runVertexArrayObject(gl, renderObject);

    runUniforms(gl, renderObject);

    runDrawCall(gl, renderObject);
}

