import { RenderAtomic } from "../data/RenderAtomic";
import { runRenderParams } from "./runRenderParams";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: RenderAtomic)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates, _elementBuffers, _uniforms, _shaders } = gl;

    const shaderResult = _shaders.activeShader(webGLRenderAtomic.shader);

    runRenderParams(gl, webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    _uniforms.activeUniforms(webGLRenderAtomic, shaderResult.uniforms);

    _elementBuffers.render(webGLRenderAtomic);
}
