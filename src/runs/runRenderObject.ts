import { RenderAtomic } from "../data/RenderAtomic";
import { runUniforms } from "./runUniforms";
import { runRenderParams } from "./runRenderParams";
import { runShader } from "./runShader";
import { runDrawCall } from "./runDrawCall";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: RenderAtomic)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates } = gl;

    runShader(gl, webGLRenderAtomic.shader);

    runRenderParams(gl, webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    runUniforms(gl, webGLRenderAtomic);

    runDrawCall(gl, webGLRenderAtomic);
}
