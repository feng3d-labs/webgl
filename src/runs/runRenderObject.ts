import { RenderAtomic } from "../data/RenderAtomic";
import { runShader } from "./runShader";
import { runRenderParams } from "./runRenderParams";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: RenderAtomic)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates, _elementBuffers, _uniforms } = gl;

    const shaderResult = runShader(gl, webGLRenderAtomic.shader);

    runRenderParams(gl, webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    _uniforms.activeUniforms(webGLRenderAtomic, shaderResult.uniforms);

    _elementBuffers.render(webGLRenderAtomic);
}
