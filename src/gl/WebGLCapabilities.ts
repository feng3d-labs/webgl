import { WebGLRenderer } from '../WebGLRenderer';

/**
 * WEBGL支持功能
 *
 * @see https://webglreport.com
 * @see http://html5test.com
 */
export class WebGLCapabilities
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
    maxPrecision: 'highp' | 'mediump' | 'lowp';

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

    private _webGLRenderer: WebGLRenderer;

    constructor(webGLRenderer: WebGLRenderer)
    {
        this._webGLRenderer = webGLRenderer;

        const { isWebGL2, extensions, gl } = this._webGLRenderer;

        this.maxAnisotropy = extensions.getExtension('EXT_texture_filter_anisotropic') ? gl.getParameter(extensions.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
        this.maxPrecision = this._getMaxPrecision();

        this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

        this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        this.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
        this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

        this.vertexTextures = this.maxVertexTextures > 0;
        this.floatFragmentTextures = isWebGL2 || !!extensions.getExtension('OES_texture_float');
        this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;

        this.maxSamples = gl instanceof WebGL2RenderingContext ? gl.getParameter(gl.MAX_SAMPLES) : 0;
        this.stencilBits = gl.getParameter(gl.STENCIL_BITS);

        this.vaoAvailable = isWebGL2 || !!extensions.getExtension('OES_vertex_array_object');
    }

    private _getMaxPrecision(precision: 'highp' | 'mediump' | 'lowp' = 'highp')
    {
        const { gl } = this._webGLRenderer;

        if (precision === 'highp')
        {
            if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0
                && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0)
            {
                return 'highp';
            }
            precision = 'mediump';
        }
        if (precision === 'mediump')
        {
            if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0
                && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0)
            {
                return 'mediump';
            }
        }

        return 'lowp';
    }
}
