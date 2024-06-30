import { IRenderObject } from "../data/IRenderObject";
import { runDrawCall } from "./runDrawCall";
import { runIndexBuffer } from "./runIndexBuffer";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runVertexAttributes } from "./runVertexAttributes";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    runViewPort(gl, renderObject.viewport);

    runScissor(gl, renderObject.scissor);

    runRenderPipeline(gl, renderObject.pipeline);

    runVertexAttributes(gl, renderObject);

    runIndexBuffer(gl, renderObject.index);

    runUniforms(gl, renderObject);

    runDrawCall(gl, renderObject);
}

// export const defaultRenderObject: IRenderObject = { viewport };