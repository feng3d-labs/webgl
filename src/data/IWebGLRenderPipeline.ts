/**
 * WebGL渲染管线
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram
 */
export class IWebGLRenderPipeline
{
    /**
     * 着色器名称
     */
    shaderName?: string;

    /**
     * 顶点着色器代码
     */
    vertex: string;

    /**
     * 片段着色器代码
     */
    fragment: string;
}
