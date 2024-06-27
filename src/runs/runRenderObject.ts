import { RenderAtomic } from "../data/RenderAtomic";
import { runUniforms } from "./runUniforms";
import { runRenderParams } from "./runRenderParams";
import { runShader } from "./runShader";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: RenderAtomic)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates, _elementBuffers } = gl;

    runShader(gl, webGLRenderAtomic.shader);

    runRenderParams(gl, webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    runUniforms(gl, webGLRenderAtomic);

    _elementBuffers.render(gl, webGLRenderAtomic);
}
