import { IRenderObject } from "../data/IRenderObject";
import { runUniforms } from "./runUniforms";
import { runRenderParams } from "./runRenderParams";
import { runRenderPipeline } from "./runRenderPipeline";
import { runDrawCall } from "./runDrawCall";
import { runViewPort } from "./runViewPort";
import { runScissor } from "./runScissor";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates } = gl;

    runViewPort(gl, webGLRenderAtomic.viewport);

    runScissor(gl, webGLRenderAtomic.scissor);

    runRenderPipeline(gl, webGLRenderAtomic.pipeline);

    runRenderParams(gl, webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    runUniforms(gl, webGLRenderAtomic);

    runDrawCall(gl, webGLRenderAtomic);
}
