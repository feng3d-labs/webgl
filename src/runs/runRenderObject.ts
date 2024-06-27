import { RenderAtomic } from "../data/RenderAtomic";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: RenderAtomic)
{
    const webGLRenderAtomic = renderObject;

    const { _bindingStates, _renderParams, _elementBuffers, _uniforms, _shaders } = gl;

    const shaderResult = _shaders.activeShader(webGLRenderAtomic);

    _renderParams.updateRenderParams(webGLRenderAtomic.renderParams);

    _bindingStates.setup(webGLRenderAtomic);

    _uniforms.activeUniforms(webGLRenderAtomic, shaderResult.uniforms);

    _elementBuffers.render(webGLRenderAtomic);
}
