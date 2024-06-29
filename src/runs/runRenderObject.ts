import { IRenderObject } from "../data/IRenderObject";
import { setup } from "../gl/WebGLBindingStates";
import { runDrawCall } from "./runDrawCall";
import { runRenderPipeline } from "./runRenderPipeline";
import { runScissor } from "./runScissor";
import { runUniforms } from "./runUniforms";
import { runViewPort } from "./runViewPort";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const webGLRenderAtomic = renderObject;

    runViewPort(gl, webGLRenderAtomic.viewport);

    runScissor(gl, webGLRenderAtomic.scissor);

    runRenderPipeline(gl, webGLRenderAtomic.pipeline);

    setup(gl, webGLRenderAtomic);

    runUniforms(gl, webGLRenderAtomic);

    runDrawCall(gl, webGLRenderAtomic);
}
