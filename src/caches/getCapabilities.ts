
export function getCapabilities(gl: WebGLRenderingContext, precision: "highp" | "mediump" | "lowp" = "highp")
{
    let capabilities = capabilitiesMap.get(gl);
    if (capabilities) return capabilities;

    capabilities = new Capabilities(gl, precision);
    capabilitiesMap.set(gl, capabilities);

    return capabilities;
}

const capabilitiesMap = new WeakMap<WebGLRenderingContext, Capabilities>();

function _getMaxPrecision(gl: WebGLRenderingContext, precision: "highp" | "mediump" | "lowp" = "highp")
{
    if (precision === "highp")
    {
        if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0
            && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0)
        {
            return "highp";
        }
        precision = "mediump";
    }
    if (precision === "mediump")
    {
        if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0
            && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0)
        {
            return "mediump";
        }
    }

    return "lowp";
}

/**
 * WEBGL支持功能
 *
 * @see https://webglreport.com
 * @see http://html5test.com
 */
export class Capabilities
{
    /**
     * 纹理各向异性过滤最大值
     */
    get maxAnisotropy()
    {
        if (this._maxAnisotropy) return this._maxAnisotropy;
        this._maxAnisotropy = this._gl.getExtension("EXT_texture_filter_anisotropic") ? this._gl.getParameter(this._gl.getExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
        return this._maxAnisotropy;
    }
    private _maxAnisotropy: number;

    /**
     * 支持最大纹理数量
     */
    get maxTextures()
    {
        if (this._maxTextures) return this._maxTextures;
        this._maxTextures = this._gl.getParameter(this._gl.MAX_TEXTURE_IMAGE_UNITS);
        return this._maxTextures;
    }
    private _maxTextures: number;

    /**
     * 支持最大顶点纹理数量
     */
    get maxVertexTextures()
    {
        if (this._maxVertexTextures) return this._maxVertexTextures;
        this._maxVertexTextures = this._gl.getParameter(this._gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        return this._maxVertexTextures;
    }
    private _maxVertexTextures: number;

    /**
     * 支持最大纹理尺寸
     */
    get maxTextureSize()
    {
        if (this._maxTextureSize) return this._maxTextureSize;
        this._maxTextureSize = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
        return this._maxTextureSize;
    }
    private _maxTextureSize: number;

    /**
     * 支持最大立方体贴图尺寸
     */
    get maxCubemapSize()
    {
        if (this._maxCubemapSize) return this._maxCubemapSize;
        this._maxCubemapSize = this._gl.getParameter(this._gl.MAX_CUBE_MAP_TEXTURE_SIZE);
        return this._maxCubemapSize;
    }
    private _maxCubemapSize: number;

    /**
     * 支持属性数量
     */
    get maxAttributes()
    {
        if (this._maxAttributes) return this._maxAttributes;
        this._maxAttributes = this._gl.getParameter(this._gl.MAX_VERTEX_ATTRIBS);
        return this._maxAttributes;
    }
    private _maxAttributes: number;

    /**
     * 顶点着色器支持最大 Uniform 数量
     */
    get maxVertexUniforms()
    {
        if (this._maxVertexUniforms) return this._maxVertexUniforms;
        this._maxVertexUniforms = this._gl.getParameter(this._gl.MAX_VERTEX_UNIFORM_VECTORS);
        return this._maxVertexUniforms;
    }
    private _maxVertexUniforms: number;

    /**
     * 支持最大shader之间传递的变量数
     */
    get maxVaryings()
    {
        if (this._maxVaryings) return this._maxVaryings;
        this._maxVaryings = this._gl.getParameter(this._gl.MAX_VARYING_VECTORS);
        return this._maxVaryings;
    }
    private _maxVaryings: number;

    /**
     * 片段着色器支持最大 Uniform 数量
     */
    get maxFragmentUniforms()
    {
        if (this._maxFragmentUniforms) return this._maxFragmentUniforms;
        this._maxFragmentUniforms = this._gl.getParameter(this._gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        return this._maxFragmentUniforms;
    }
    private _maxFragmentUniforms: number;

    /**
     * 是否支持顶点纹理
     */
    get vertexTextures()
    {
        if (this._vertexTextures) return this._vertexTextures;
        this._vertexTextures = this.maxVertexTextures > 0;
        return this._vertexTextures;
    }
    private _vertexTextures: boolean;

    /**
     * 是否支持浮点类型片段着色器纹理
     */
    get floatFragmentTextures()
    {
        if (this._floatFragmentTextures) return this._floatFragmentTextures;
        this._floatFragmentTextures = this._gl instanceof WebGL2RenderingContext || !!this._gl.getExtension("OES_texture_float");
        return this._floatFragmentTextures;
    }
    private _floatFragmentTextures: boolean;

    /**
     * 是否支持浮点类型顶点着色器纹理
     */
    get floatVertexTextures()
    {
        if (this._floatVertexTextures) return this._floatVertexTextures;
        this._floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;
        return this._floatVertexTextures;
    }
    private _floatVertexTextures: boolean;

    /**
     * Shader中支持浮点类型的最高精度
     */
    get maxPrecision()
    {
        if (this._maxPrecision) return this._maxPrecision;
        this._maxPrecision = _getMaxPrecision(this._gl, this._precision);
        return this._maxPrecision;
    }
    private _maxPrecision: "highp" | "mediump" | "lowp";


    /**
     *
     */
    get maxSamples()
    {
        if (this._maxSamples) return this._maxSamples;
        this._maxSamples = this._gl instanceof WebGL2RenderingContext ? this._gl.getParameter(this._gl.MAX_SAMPLES) : 0;
        return this._maxSamples;
    }
    private _maxSamples: number;

    /**
     * 支持模板的位数
     */
    get stencilBits()
    {
        if (this._stencilBits) return this._stencilBits;
        this._stencilBits = this._gl.getParameter(this._gl.STENCIL_BITS);
        return this._stencilBits;
    }
    private _stencilBits: number;

    /**
     * 是否支持VAO。
     */
    get vaoAvailable()
    {
        if (this._vaoAvailable) return this._vaoAvailable;
        this._vaoAvailable = this._gl instanceof WebGL2RenderingContext || !!this._gl.getExtension("OES_vertex_array_object");
        return this._vaoAvailable;
    }
    private _vaoAvailable: boolean;

    constructor(private _gl: WebGLRenderingContext, private _precision: "highp" | "mediump" | "lowp")
    {
    }
}
