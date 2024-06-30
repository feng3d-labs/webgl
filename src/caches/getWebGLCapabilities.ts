import { IWebGLCapabilities } from "../data/IWebGLCapabilities";

export function getWebGLCapabilities(gl: WebGLRenderingContext, precision: "highp" | "mediump" | "lowp" = "highp")
{
    const capabilities: IWebGLCapabilities = {} as any;
    gl._capabilities = capabilities;
    //
    capabilities.maxAnisotropy = gl.getExtension("EXT_texture_filter_anisotropic") ? gl.getParameter(gl.getExtension("EXT_texture_filter_anisotropic").MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
    capabilities.maxPrecision = _getMaxPrecision(gl, precision);

    capabilities.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    capabilities.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    capabilities.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    capabilities.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    capabilities.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    capabilities.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    capabilities.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    capabilities.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    capabilities.vertexTextures = capabilities.maxVertexTextures > 0;
    capabilities.floatFragmentTextures = gl instanceof WebGL2RenderingContext || !!gl.getExtension("OES_texture_float");
    capabilities.floatVertexTextures = capabilities.vertexTextures && capabilities.floatFragmentTextures;

    capabilities.maxSamples = gl instanceof WebGL2RenderingContext ? gl.getParameter(gl.MAX_SAMPLES) : 0;
    capabilities.stencilBits = gl.getParameter(gl.STENCIL_BITS);

    capabilities.vaoAvailable = gl instanceof WebGL2RenderingContext || !!gl.getExtension("OES_vertex_array_object");

    return capabilities;
}

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