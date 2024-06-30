import { TextureMagFilter, TextureMinFilter, TextureWrap } from "../data/ITexture";

/**
 * A GLenum specifying the binding point (target). Possible values:
 *
 * * gl.ARRAY_BUFFER: Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color data.
 * * gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 * * gl.COPY_READ_BUFFER: Buffer for copying from one buffer object to another.
 * * gl.COPY_WRITE_BUFFER: Buffer for copying from one buffer object to another.
 * * gl.TRANSFORM_FEEDBACK_BUFFER: Buffer for transform feedback operations.
 * * gl.UNIFORM_BUFFER: Buffer used for storing uniform blocks.
 * * gl.PIXEL_PACK_BUFFER: Buffer used for pixel transfer operations.
 * * gl.PIXEL_UNPACK_BUFFER: Buffer used for pixel transfer operations.
 *
 */
export type BufferTarget = "ARRAY_BUFFER" | "ELEMENT_ARRAY_BUFFER" // WebGL1
    | "COPY_READ_BUFFER" | "COPY_WRITE_BUFFER" | "TRANSFORM_FEEDBACK_BUFFER"// WebGL2
    | "UNIFORM_BUFFER" | "PIXEL_PACK_BUFFER" | "PIXEL_UNPACK_BUFFER"; // WebGL2

/**
 * A GLenum specifying which WebGL capability to enable. Possible values:
 *
 * gl.BLEND	Activates blending of the computed fragment color values. See WebGLRenderingContext.blendFunc().
 * gl.CULL_FACE	Activates culling of polygons. See WebGLRenderingContext.cullFace().
 * gl.DEPTH_TEST	Activates depth comparisons and updates to the depth buffer. See WebGLRenderingContext.depthFunc().
 * gl.DITHER	Activates dithering of color components before they get written to the color buffer.
 * gl.POLYGON_OFFSET_FILL	Activates adding an offset to depth values of polygon's fragments. See WebGLRenderingContext.polygonOffset().
 * gl.SAMPLE_ALPHA_TO_COVERAGE	Activates the computation of a temporary coverage value determined by the alpha value.
 * gl.SAMPLE_COVERAGE	Activates ANDing the fragment's coverage with the temporary coverage value. See WebGLRenderingContext.sampleCoverage().
 * gl.SCISSOR_TEST	Activates the scissor test that discards fragments that are outside of the scissor rectangle. See WebGLRenderingContext.scissor().
 * gl.STENCIL_TEST	Activates stencil testing and updates to the stencil buffer. See WebGLRenderingContext.stencilFunc().
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * gl.RASTERIZER_DISCARD	Primitives are discarded immediately before the rasterization stage, but after the optional transform feedback stage. gl.clear() commands are ignored.
 */
export type Capability =
    "BLEND" | "CULL_FACE" | "DEPTH_TEST" | "DITHER"
    | "POLYGON_OFFSET_FILL" | "SAMPLE_ALPHA_TO_COVERAGE" | "SAMPLE_COVERAGE"
    | "SCISSOR_TEST"
    | "STENCIL_TEST"
    | "RASTERIZER_DISCARD"
    ;

/**
 * A GLenum specifying the format of the pixel data. Possible values:
 *
 * * gl.ALPHA Discards the red, green and blue components and reads the alpha component.
 * * gl.RGB   Discards the alpha components and reads the red, green and blue components.
 * * gl.RGBA  Red, green, blue and alpha components are read from the color buffer.
 *
 * WebGL2 adds
 *
 * * gl.RED
 * * gl.RG
 * * gl.RED_INTEGER
 * * gl.RG_INTEGER
 * * gl.RGB_INTEGER
 * * gl.RGBA_INTEGER
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
 */
export type ReadPixelsFormat = "ALPHA" | "RGB" | "RGBA" // WebGL1
    | "RED" | "RG" | "RED_INTEGER" | "RG_INTEGER" | "RGB_INTEGER" | "RGBA_INTEGER" // WebGL2
    ;

/**
 * A GLenum specifying the data type of the pixel data. Possible values:
 * * gl.UNSIGNED_BYTE
 * * gl.UNSIGNED_SHORT_5_6_5
 * * gl.UNSIGNED_SHORT_4_4_4_4
 * * gl.UNSIGNED_SHORT_5_5_5_1
 * * gl.FLOAT
 *
 * WebGL2 adds
 * * gl.BYTE
 * * gl.UNSIGNED_INT_2_10_10_10_REV
 * * gl.HALF_FLOAT
 * * gl.SHORT
 * * gl.UNSIGNED_SHORT
 * * gl.INT
 * * gl.UNSIGNED_INT
 * * gl.UNSIGNED_INT_10F_11F_11F_REV
 * * gl.UNSIGNED_INT_5_9_9_9_REV
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
 */
export type ReadPixelsType =
    | "UNSIGNED_BYTE"
    | "UNSIGNED_SHORT_5_6_5"
    | "UNSIGNED_SHORT_4_4_4_4"
    | "UNSIGNED_SHORT_5_5_5_1"
    | "FLOAT"
    | "BYTE"
    | "UNSIGNED_INT_2_10_10_10_REV"
    | "HALF_FLOAT"
    | "SHORT"
    | "UNSIGNED_SHORT"
    | "INT"
    | "UNSIGNED_INT"
    | "UNSIGNED_INT_10F_11F_11F_REV"
    | "UNSIGNED_INT_5_9_9_9_REV"
    ;

/**
 * The pname parameter is a GLenum specifying the texture parameter to set.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter
 */
export interface TexParameteri extends TexParameteri_WebGL2
{
    /**
     * Texture magnification filter
     */
    TEXTURE_MAG_FILTER: TextureMagFilter;

    /**
     * Texture minification filter
     */
    TEXTURE_MIN_FILTER: TextureMinFilter;

    /**
     * Wrapping function for texture coordinate s
     */
    TEXTURE_WRAP_S: TextureWrap;

    /**
     * Wrapping function for texture coordinate t
     */
    TEXTURE_WRAP_T: TextureWrap;
}

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
    TEXTURE_WRAP_R: TextureWrap;
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

/**
 * A GLenum specifying the attachment point for the texture. Possible values:
 *
 * gl.COLOR_ATTACHMENT0: Attaches the texture to the framebuffer's color buffer.
 * gl.DEPTH_ATTACHMENT: Attaches the texture to the framebuffer's depth buffer.
 * gl.STENCIL_ATTACHMENT: Attaches the texture to the framebuffer's stencil buffer.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * gl.DEPTH_STENCIL_ATTACHMENT: depth and stencil buffer.
 * gl.COLOR_ATTACHMENT1 gl.COLOR_ATTACHMENT2 gl.COLOR_ATTACHMENT3 gl.COLOR_ATTACHMENT4 gl.COLOR_ATTACHMENT5 gl.COLOR_ATTACHMENT6 gl.COLOR_ATTACHMENT7 gl.COLOR_ATTACHMENT8 gl.COLOR_ATTACHMENT9 gl.COLOR_ATTACHMENT10 gl.COLOR_ATTACHMENT11 gl.COLOR_ATTACHMENT12 gl.COLOR_ATTACHMENT13 gl.COLOR_ATTACHMENT14 gl.COLOR_ATTACHMENT15
 */
export type AttachmentPoint = "COLOR_ATTACHMENT0" | "DEPTH_ATTACHMENT" | "STENCIL_ATTACHMENT"
    | "DEPTH_STENCIL_ATTACHMENT"
    | "COLOR_ATTACHMENT1" | "COLOR_ATTACHMENT2" | "COLOR_ATTACHMENT3" | "COLOR_ATTACHMENT4" | "COLOR_ATTACHMENT5"
    | "COLOR_ATTACHMENT6" | "COLOR_ATTACHMENT7" | "COLOR_ATTACHMENT8" | "COLOR_ATTACHMENT9" | "COLOR_ATTACHMENT10"
    | "COLOR_ATTACHMENT11" | "COLOR_ATTACHMENT12" | "COLOR_ATTACHMENT13" | "COLOR_ATTACHMENT14" | "COLOR_ATTACHMENT15"
    ;
