import { GLTextureWrap } from "../caches/getGLSampler";

/**
 * The pname parameter is a GLenum specifying the texture parameter to set.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export interface TexParameterf
{
    /**
     * 	Maximum anisotropy for a texture. A GLfloat value.
     *
     * EXT_texture_filter_anisotropic
     */
    TEXTURE_MAX_ANISOTROPY_EXT: number;

    /**
     * 	Texture maximum level-of-detail value. Any float values.
     */
    TEXTURE_MAX_LOD: number;

    /**
     * TEXTURE_MIN_LOD	Texture minimum level-of-detail value	Any float values.
     */
    TEXTURE_MIN_LOD: number;
}

export interface TexParameteri_WebGL2
{
    /**
     * Texture mipmap level. Any int values.
     */
    TEXTURE_BASE_LEVEL: number;

    /**
     * Texture Comparison function
     */
    TEXTURE_COMPARE_FUNC: "LEQUAL" | "GEQUAL" | "LESS" | "GREATER" | "EQUAL" | "NOTEQUAL" | "ALWAYS" | "NEVER";

    /**
     * Texture comparison mode
     */
    TEXTURE_COMPARE_MODE: "NONE" | "COMPARE_REF_TO_TEXTURE";

    /**
     * 	Maximum texture mipmap array level. Any int values.
     */
    TEXTURE_MAX_LEVEL: number;

    /**
     * Wrapping function for texture coordinate r
     */
    TEXTURE_WRAP_R: GLTextureWrap;
}

/**
 * A GLenum specifying the texture target.
 *
 * gl.TEXTURE_2D: A two-dimensional texture.
 * gl.TEXTURE_CUBE_MAP_POSITIVE_X: Positive X face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_NEGATIVE_X: Negative X face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_POSITIVE_Y: Positive Y face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_NEGATIVE_Y: Negative Y face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_POSITIVE_Z: Positive Z face for a cube-mapped texture.
 * gl.TEXTURE_CUBE_MAP_NEGATIVE_Z: Negative Z face for a cube-mapped texture.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 */
export type TexImage2DTarget = "TEXTURE_2D"
    | "TEXTURE_CUBE_MAP_POSITIVE_X"
    | "TEXTURE_CUBE_MAP_NEGATIVE_X"
    | "TEXTURE_CUBE_MAP_POSITIVE_Y"
    | "TEXTURE_CUBE_MAP_NEGATIVE_Y"
    | "TEXTURE_CUBE_MAP_POSITIVE_Z"
    | "TEXTURE_CUBE_MAP_NEGATIVE_Z";

/**
 * A GLenum specifying the binding point (target). Possible values:
 *
 * gl.RENDERBUFFER  Buffer data storage for single images in a renderable internal format.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
 */
export type Renderbuffertarget = "RENDERBUFFER";

/**
 * A GLenum specifying the information to query. Possible values:
 *
 * gl.DELETE_STATUS     Returns a GLboolean indicating whether or not the shader is flagged for deletion.
 * gl.COMPILE_STATUS    Returns a GLboolean indicating whether or not the last shader compilation was successful.
 * gl.SHADER_TYPE       Returns a GLenum indicating whether the shader is a vertex shader (gl.VERTEX_SHADER) or fragment shader (gl.FRAGMENT_SHADER) object.
 */
export interface ShaderParameter
{
    /**
     * Returns a GLboolean indicating whether or not the shader is flagged for deletion.
     */
    DELETE_STATUS: GLboolean;

    /**
     * Returns a GLboolean indicating whether or not the last shader compilation was successful.
     */
    COMPILE_STATUS: GLboolean;

    /**
     * Returns a GLenum indicating whether the shader is a vertex shader (gl.VERTEX_SHADER) or fragment shader (gl.FRAGMENT_SHADER) object.
     */
    SHADER_TYPE: number;
}

/**
 * Pixel storage parameters
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
 */
export interface PixelStoreiParameter extends PixelStoreiParameter_WebGL1 { }
export interface PixelStoreiParameter_WebGL1
{
    /**
     * Packing of pixel data into memory. default 4.
     */
    PACK_ALIGNMENT: 1 | 2 | 4 | 8;

    /**
     * Unpacking of pixel data from memory. default 4.
     */
    UNPACK_ALIGNMENT: 1 | 2 | 4 | 8;

    /**
     * Flips the source data along its vertical axis if true. default false.
     */
    UNPACK_FLIP_Y_WEBGL: GLboolean;

    /**
     * Multiplies the alpha channel into the other color channels. default false.
     */
    UNPACK_PREMULTIPLY_ALPHA_WEBGL: GLboolean;

    /**
     * Default color space conversion or no color space conversion. default gl.BROWSER_DEFAULT_WEBGL.
     */
    UNPACK_COLORSPACE_CONVERSION_WEBGL: "BROWSER_DEFAULT_WEBGL" | "NONE";
}

/**
 * A GLenum specifying the information to query. Possible values:
 * * gl.DELETE_STATUS       Returns a GLboolean indicating whether or not the program is flagged for deletion.
 * * gl.LINK_STATUS         Returns a GLboolean indicating whether or not the last link operation was successful.
 * * gl.VALIDATE_STATUS     Returns a GLboolean indicating whether or not the last validation operation was successful.
 * * gl.ATTACHED_SHADERS    Returns a GLint indicating the number of attached shaders to a program.
 * * gl.ACTIVE_ATTRIBUTES   Returns a GLint indicating the number of active attribute variables to a program.
 * * gl.ACTIVE_UNIFORMS     Returns a GLint indicating the number of active uniform variables to a program.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 * * gl.TRANSFORM_FEEDBACK_BUFFER_MODE      Returns a GLenum indicating the buffer mode when transform feedback is active. May be gl.SEPARATE_ATTRIBS or gl.INTERLEAVED_ATTRIBS.
 * * gl.TRANSFORM_FEEDBACK_VARYINGS         Returns a GLint indicating the number of varying variables to capture in transform feedback mode.
 * * gl.ACTIVE_UNIFORM_BLOCKS               Returns a GLint indicating the number of uniform blocks containing active uniforms.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getProgramParameter
 */
export interface ProgramParameter
{
    /**
     * Returns a GLboolean indicating whether or not the program is flagged for deletion.
     */
    DELETE_STATUS: GLboolean;

    /**
     * Returns a GLboolean indicating whether or not the last link operation was successful.
     */
    LINK_STATUS: GLboolean;

    /**
     * Returns a GLboolean indicating whether or not the last validation operation was successful.
     */
    VALIDATE_STATUS: GLboolean;

    /**
     * Returns a GLint indicating the number of attached shaders to a program.
     */
    ATTACHED_SHADERS: GLint;

    /**
     * Returns a GLint indicating the number of active attribute variables to a program.
     */
    ACTIVE_ATTRIBUTES: GLint;

    /**
     * Returns a GLint indicating the number of active uniform variables to a program.
     */
    ACTIVE_UNIFORMS: GLint;

    /**
     * Returns a GLenum indicating the buffer mode when transform feedback is active. May be gl.SEPARATE_ATTRIBS or gl.INTERLEAVED_ATTRIBS.
     */
    TRANSFORM_FEEDBACK_BUFFER_MODE: GLenum;

    /**
     * Returns a GLint indicating the number of varying variables to capture in transform feedback mode.
     */
    TRANSFORM_FEEDBACK_VARYINGS: GLint;

    /**
     * Returns a GLint indicating the number of uniform blocks containing active uniforms.
     */
    ACTIVE_UNIFORM_BLOCKS: GLint;
}

/**
 * A precision type value. Either gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT, gl.LOW_INT, gl.MEDIUM_INT, or gl.HIGH_INT.
 */
export type PrecisionType = "LOW_FLOAT" | "MEDIUM_FLOAT" | "HIGH_FLOAT" | "LOW_INT" | "MEDIUM_INT" | "HIGH_INT";
