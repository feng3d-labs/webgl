declare global
{
    interface WebGLRenderingContext
    {
        /**
         * WEBGL支持功能
        */
        _capabilities: IWebGLCapabilities;
    }
}

/**
 * WEBGL支持功能
 *
 * @see https://webglreport.com
 * @see http://html5test.com
 */
export interface IWebGLCapabilities
{
    /**
     * 纹理各向异性过滤最大值
     */
    maxAnisotropy: number;

    /**
     * 支持最大纹理数量
     */
    maxTextures: number;

    /**
     * 支持最大顶点纹理数量
     */
    maxVertexTextures: number;

    /**
     * 支持最大纹理尺寸
     */
    maxTextureSize: number;

    /**
     * 支持最大立方体贴图尺寸
     */
    maxCubemapSize: number;

    /**
     * 支持属性数量
     */
    maxAttributes: number;

    /**
     * 顶点着色器支持最大 Uniform 数量
     */
    maxVertexUniforms: number;

    /**
     * 支持最大shader之间传递的变量数
     */
    maxVaryings: number;

    /**
     * 片段着色器支持最大 Uniform 数量
     */
    maxFragmentUniforms: number;

    /**
     * 是否支持顶点纹理
     */
    vertexTextures: boolean;

    /**
     * 是否支持浮点类型片段着色器纹理
     */
    floatFragmentTextures: boolean;

    /**
     * 是否支持浮点类型顶点着色器纹理
     */
    floatVertexTextures: boolean;

    /**
     * Shader中支持浮点类型的最高精度
     */
    maxPrecision: "highp" | "mediump" | "lowp";

    /**
     *
     */
    maxSamples: number;

    /**
     * 支持模板的位数
     */
    stencilBits: number;

    /**
     * 是否支持VAO。
     */
    vaoAvailable: boolean;
}
