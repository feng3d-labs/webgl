import { RenderAtomic } from "../data/RenderAtomic";
import { runUniforms } from "./runUniforms";
import { runRenderParams } from "./runRenderParams";
import { runRenderPipeline } from "./runRenderPipeline";
import { runDrawCall } from "./runDrawCall";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: RenderAtomic)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates } = gl;

    runRenderPipeline(gl, webGLRenderAtomic.pipeline);

    runRenderParams(gl, webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    runUniforms(gl, webGLRenderAtomic);

    runDrawCall(gl, webGLRenderAtomic);
}
