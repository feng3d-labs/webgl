import { VertexAttributeTypes } from './data/AttributeBuffer';
import { FrontFace, StencilFunc, StencilOp } from './data/RenderParams';
import { AttachmentPoint, FramebufferTarget, PixelStoreiParameter, PrecisionType, ProgramParameter, RenderbufferInternalformat, Renderbuffertarget, ShaderParameter, ShaderType, TexImage2DTarget, TexParameterf, TexParameteri, TextureTarget } from './gl/WebGLEnums';
import { WebGLExtensionMapFull } from './gl/WebGLExtensions';
import { WebGLParameters } from './gl/WebGLParameters';
import { WebGLRenderer } from './WebGLRenderer';

/**
 * 对应 lib.dom.d.ts 中 WebGLRenderingContextBase 接口。
 */
export class WebGLContextBase
{
    protected _webGLRenderer: WebGLRenderer;

    constructor(webGLRenderer: WebGLRenderer)
    {
        this._webGLRenderer = webGLRenderer;
    }

    /**
     * The WebGLRenderingContext.getProgramInfoLog returns the information log for the specified WebGLProgram object. It contains errors that occurred during failed linking or validation of WebGLProgram objects.
     *
     * @param program The WebGLProgram to query.
     * @returns A string that contains diagnostic messages, warning messages, and other information about the last linking or validation operation. When a WebGLProgram object is initially created, its information log will be a string of length 0.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getProgramInfoLog
     */
    getProgramInfoLog(program: WebGLProgram): string | null
    {
        const { gl } = this._webGLRenderer;
        const infoLog = gl.getProgramInfoLog(program);

        return infoLog;
    }

    /**
     * The WebGLRenderingContext.getProgramParameter() method of the WebGL API returns information about the given program.
     *
     * @param program A WebGLProgram to get parameter information from.
     * @param pname A GLenum specifying the information to query.
     * @returns Returns the requested program information (as specified with pname).
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getProgramParameter
     */
    getProgramParameter<K extends keyof ProgramParameter>(program: WebGLProgram, pname: K): ProgramParameter[K]
    {
        const { gl2 } = this._webGLRenderer;
        const result = gl2.getProgramParameter(program, gl2[pname]);

        return result;
    }

    // getRenderbufferParameter(target: GLenum, pname: GLenum): any;

    /**
     * The WebGLRenderingContext.getShaderInfoLog returns the information log for the specified WebGLShader object. It contains warnings, debugging and compile information.
     *
     * @param shader A WebGLShader to query.
     * @returns A string that contains diagnostic messages, warning messages, and other information about the last compile operation. When a WebGLShader object is initially created, its information log will be a string of length 0.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderInfoLog
     */
    getShaderInfoLog(shader: WebGLShader): string | null
    {
        const { gl } = this._webGLRenderer;
        const info = gl.getShaderInfoLog(shader);

        return info;
    }

    /**
     * The WebGLRenderingContext.getShaderParameter() method of the WebGL API returns information about the given shader.
     *
     * @param shader A WebGLShader to get parameter information from.
     * @param pname A GLenum specifying the information to query.
     * @returns Returns the requested shader information (as specified with pname).
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderParameter
     */
    getShaderParameter<K extends keyof ShaderParameter>(shader: WebGLShader, pname: K): ShaderParameter[K]
    {
        const { gl } = this._webGLRenderer;
        const result = gl.getShaderParameter(shader, gl[pname]);

        return result;
    }

    /**
     * The WebGLRenderingContext.getShaderPrecisionFormat() method of the WebGL API returns a new WebGLShaderPrecisionFormat object describing the range and precision for the specified shader numeric format.
     *
     * @param shadertype Either a gl.FRAGMENT_SHADER or a gl.VERTEX_SHADER.
     * @param precisiontype A precision type value. Either gl.LOW_FLOAT, gl.MEDIUM_FLOAT, gl.HIGH_FLOAT, gl.LOW_INT, gl.MEDIUM_INT, or gl.HIGH_INT.
     * @returns A WebGLShaderPrecisionFormat object or null, if an error occurs.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat
     */
    getShaderPrecisionFormat(shadertype: ShaderType, precisiontype: PrecisionType): WebGLShaderPrecisionFormat | null
    {
        const { gl } = this._webGLRenderer;
        const result = gl.getShaderPrecisionFormat(gl[shadertype], gl[precisiontype]);

        return result;
    }

    // getShaderSource(shader: WebGLShader): string | null;
    // getSupportedExtensions(): string[] | null;
    // getTexParameter(target: GLenum, pname: GLenum): any;
    // getUniform(program: WebGLProgram, location: WebGLUniformLocation): any;

    /**
     * Part of the WebGL API, the WebGLRenderingContext method getUniformLocation() returns the location of a specific uniform variable which is part of a given WebGLProgram.
     *
     * @param program The WebGLProgram in which to locate the specified uniform variable.
     * @param name A string specifying the name of the uniform variable whose location is to be returned. The name can't have any whitespace in it, and you can't use this function to get the location of any uniforms starting with the reserved string "gl_", since those are internal to the WebGL layer.
     * @returns A WebGLUniformLocation value indicating the location of the named variable, if it exists. If the specified variable doesn't exist, null is returned instead.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getUniformLocation
     */
    getUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation | null
    {
        const { gl } = this._webGLRenderer;
        const location = gl.getUniformLocation(program, name);

        return location;
    }

    // getVertexAttrib(index: GLuint, pname: GLenum): any;
    // getVertexAttribOffset(index: GLuint, pname: GLenum): GLintptr;
    // hint(target: GLenum, mode: GLenum): void;
    // isBuffer(buffer: WebGLBuffer | null): GLboolean;
    // isContextLost(): boolean;
    // isEnabled(cap: GLenum): GLboolean;
    // isFramebuffer(framebuffer: WebGLFramebuffer | null): GLboolean;
    // isProgram(program: WebGLProgram | null): GLboolean;
    // isRenderbuffer(renderbuffer: WebGLRenderbuffer | null): GLboolean;
    // isShader(shader: WebGLShader | null): GLboolean;
    // isTexture(texture: WebGLTexture | null): GLboolean;
    // lineWidth(width: GLfloat): void;

    /**
     * The WebGLRenderingContext interface's linkProgram() method links a given WebGLProgram, completing the process of preparing the GPU code for the program's fragment and vertex shaders.
     *
     * @param program  The WebGLProgram to link.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/linkProgram
     */
    linkProgram(program: WebGLProgram): void
    {
        const { gl } = this._webGLRenderer;
        gl.linkProgram(program);
    }

    /**
     * The WebGLRenderingContext.pixelStorei() method of the WebGL API specifies the pixel storage modes.
     *
     * @param pname A GLenum specifying which parameter to set.
     * @param param A GLint specifying a value to set the pname parameter to.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei
     */
    pixelStorei<K extends keyof PixelStoreiParameter>(pname: K, param: PixelStoreiParameter[K]): void
    {
        const { gl } = this._webGLRenderer;

        let paramV: number | boolean = param as any;
        if (typeof param === 'string')
        {
            paramV = gl[param];
        }

        gl.pixelStorei(gl[pname], paramV);
    }

    /**
     * The WebGLRenderingContext.polygonOffset() method of the WebGL API specifies the scale factors and units to calculate depth values.
     *
     * The offset is added before the depth test is performed and before the value is written into the depth buffer.
     *
     * @param factor A GLfloat which sets the scale factor for the variable depth offset for each polygon. The default value is 0.
     * @param units A GLfloat which sets the multiplier by which an implementation-specific value is multiplied with to create a constant depth offset. The default value is 0.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/polygonOffset
     */
    polygonOffset(factor: GLfloat, units: GLfloat): void
    {
        const { gl } = this._webGLRenderer;
        gl.polygonOffset(factor, units);
    }

    /**
     * The WebGLRenderingContext.renderbufferStorage() method of the WebGL API creates and initializes a renderbuffer object's data store.
     *
     * @param target A GLenum specifying the target renderbuffer object. Possible values:
     * @param internalformat A GLenum specifying the internal format of the renderbuffer.
     * @param width A GLsizei specifying the width of the renderbuffer in pixels.
     * @param height A GLsizei specifying the height of the renderbuffer in pixels.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/renderbufferStorage
     */
    renderbufferStorage(target: Renderbuffertarget, internalformat: RenderbufferInternalformat, width: GLsizei, height: GLsizei): void
    {
        const { gl } = this._webGLRenderer;
        gl.renderbufferStorage(gl[target], gl[internalformat], width, height);
    }

    // sampleCoverage(value: GLclampf, invert: GLboolean): void;

    /**
     * The WebGLRenderingContext.scissor() method of the WebGL API sets a scissor box, which limits the drawing to a specified rectangle.
     *
     * @param x A GLint specifying the horizontal coordinate for the lower left corner of the box. Default value: 0.
     * @param y A GLint specifying the vertical coordinate for the lower left corner of the box. Default value: 0.
     * @param width A non-negative GLsizei specifying the width of the scissor box. Default value: width of the canvas.
     * @param height A non-negative GLsizei specifying the height of the scissor box. Default value: height of the canvas.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor
     */
    scissor(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void
    {
        const { gl } = this._webGLRenderer;
        gl.scissor(x, y, width, height);
    }

    /**
     * The WebGLRenderingContext.shaderSource() method of the WebGL API sets the source code of a WebGLShader.
     *
     * @param shader A WebGLShader object in which to set the source code.
     * @param source A string containing the GLSL source code to set.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/shaderSource
     */
    shaderSource(shader: WebGLShader, source: string): void
    {
        const { gl } = this._webGLRenderer;
        gl.shaderSource(shader, source);
    }

    /**
     * The WebGLRenderingContext.stencilFunc() method of the WebGL API sets the front and back function and reference value for stencil testing.
     *
     * Stenciling enables and disables drawing on a per-pixel basis. It is typically used in multipass rendering to achieve special effects.
     *
     * @param func A GLenum specifying the test function. The default function is gl.ALWAYS.
     * @param ref A GLint specifying the reference value for the stencil test. This value is clamped to the range 0 to 2^n - 1 where n is the number of bitplanes in the stencil buffer. The default value is 0.
     * @param mask A GLuint specifying a bit-wise mask that is used to AND the reference value and the stored stencil value when the test is done. The default value is all 1.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
     */
    stencilFunc(func: StencilFunc, ref: GLint, mask: GLuint): void
    {
        const { gl } = this._webGLRenderer;
        gl.stencilFunc(gl[func], ref, mask);
    }

    // stencilFuncSeparate(face: GLenum, func: GLenum, ref: GLint, mask: GLuint): void;

    /**
     * The WebGLRenderingContext.stencilMask() method of the WebGL API controls enabling and disabling of both the front and back writing of individual bits in the stencil planes.
     *
     * The WebGLRenderingContext.stencilMaskSeparate() method can set front and back stencil writemasks to different values.
     *
     * @param mask A GLuint specifying a bit mask to enable or disable writing of individual bits in the stencil planes. By default, the mask is all 1.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilMask
     */
    stencilMask(mask: GLuint): void
    {
        const { gl } = this._webGLRenderer;
        gl.stencilMask(mask);
    }

    // stencilMaskSeparate(face: GLenum, mask: GLuint): void;

    /**
     * The WebGLRenderingContext.stencilOp() method of the WebGL API sets both the front and back-facing stencil test actions.
     *
     * @param fail A GLenum specifying the function to use when the stencil test fails. The default value is gl.KEEP.
     * @param zfail A GLenum specifying the function to use when the stencil test passes, but the depth test fails. The default value is gl.KEEP.
     * @param zpassA GLenum specifying the function to use when both the stencil test and the depth test pass, or when the stencil test passes and there is no depth buffer or depth testing is disabled. The default value is gl.KEEP.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
     */
    stencilOp(fail: StencilOp, zfail: StencilOp, zpass: StencilOp): void
    {
        const { gl } = this._webGLRenderer;
        gl.stencilOp(gl[fail], gl[zfail], gl[zpass]);
    }

    // stencilOpSeparate(face: GLenum, fail: GLenum, zfail: GLenum, zpass: GLenum): void;

    /**
     * The WebGLRenderingContext.texParameter[fi]() methods of the WebGL API set texture parameters.
     *
     * @param target A GLenum specifying the binding point (target).
     * @param pname The param parameter is a GLfloat or GLint specifying the value for the specified parameter
     * @param param The pname parameter is a GLenum specifying the texture parameter to set.
     *
     * @see The WebGLRenderingContext.texParameter[fi]() methods of the WebGL API set texture parameters.
     */
    texParameterf<K extends keyof TexParameterf>(target: TextureTarget, pname: K, param: TexParameterf[K]): void
    {
        const { gl2 } = this._webGLRenderer;
        let paramV: GLint = param as any;
        if (typeof paramV === 'string')
        {
            paramV = gl2[paramV];
        }
        gl2.texParameterf(gl2[target], gl2[pname as any], paramV);
    }

    /**
     * The WebGLRenderingContext.texParameter[fi]() methods of the WebGL API set texture parameters.
     *
     * @param target A GLenum specifying the binding point (target).
     * @param pname The param parameter is a GLfloat or GLint specifying the value for the specified parameter
     * @param param The pname parameter is a GLenum specifying the texture parameter to set.
     *
     * @see The WebGLRenderingContext.texParameter[fi]() methods of the WebGL API set texture parameters.
     */
    texParameteri<K extends keyof TexParameteri>(target: TextureTarget, pname: K, param: TexParameteri[K]): void
    {
        const { gl2 } = this._webGLRenderer;
        let paramV: GLint = param as any;
        if (typeof paramV === 'string')
        {
            paramV = gl2[paramV];
        }
        gl2.texParameteri(gl2[target], gl2[pname], paramV);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform1f(location: WebGLUniformLocation | null, x: GLfloat): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform1f(location, x);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform1i(location: WebGLUniformLocation | null, x: GLint): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform1i(location, x);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     * @param y A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform2f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform2f(location, x, y);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     * @param y A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform2i(location: WebGLUniformLocation | null, x: GLint, y: GLint): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform2i(location, x, y);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     * @param y A new value to be used for the uniform variable.
     * @param z A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform3f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat, z: GLfloat): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform3f(location, x, y, z);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     * @param y A new value to be used for the uniform variable.
     * @param z A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform3i(location: WebGLUniformLocation | null, x: GLint, y: GLint, z: GLint): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform3i(location, x, y, z);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     * @param y A new value to be used for the uniform variable.
     * @param z A new value to be used for the uniform variable.
     * @param w A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform4f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform4f(location, x, y, z, w);
    }

    /**
     * The WebGLRenderingContext.uniform[1234][fi][v]() methods of the WebGL API specify values of uniform variables. All active uniform variables defined in a program object are initialized to 0 when the program object is linked successfully. They retain the values assigned to them by a call to this method until the next successful link operation occurs on the program object, when they are once again initialized to 0.
     *
     * @param location A WebGLUniformLocation object containing the location of the uniform attribute to modify.
     * @param x A new value to be used for the uniform variable.
     * @param y A new value to be used for the uniform variable.
     * @param z A new value to be used for the uniform variable.
     * @param w A new value to be used for the uniform variable.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform
     */
    uniform4i(location: WebGLUniformLocation | null, x: GLint, y: GLint, z: GLint, w: GLint): void
    {
        const { gl } = this._webGLRenderer;
        gl.uniform4i(location, x, y, z, w);
    }

    /**
     * The WebGLRenderingContext.useProgram() method of the WebGL API sets the specified WebGLProgram as part of the current rendering state.
     *
     * @param program A WebGLProgram to use.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/useProgram
     */
    useProgram(program: WebGLProgram | null): void
    {
        const { gl } = this._webGLRenderer;
        gl.useProgram(program);
    }

    // validateProgram(program: WebGLProgram): void;
    // vertexAttrib1f(index: GLuint, x: GLfloat): void;
    // vertexAttrib1fv(index: GLuint, values: Float32List): void;
    // vertexAttrib2f(index: GLuint, x: GLfloat, y: GLfloat): void;
    // vertexAttrib2fv(index: GLuint, values: Float32List): void;
    // vertexAttrib3f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat): void;
    // vertexAttrib3fv(index: GLuint, values: Float32List): void;
    // vertexAttrib4f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): void;
    // vertexAttrib4fv(index: GLuint, values: Float32List): void;

    /**
     * The WebGLRenderingContext.vertexAttribPointer() method of the WebGL API binds the buffer currently bound to gl.ARRAY_BUFFER to a generic vertex attribute of the current vertex buffer object and specifies its layout.
     *
     * @param index A GLuint specifying the index of the vertex attribute that is to be modified.
     * @param size A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
     * @param type A GLenum specifying the data type of each component in the array.
     * @param normalized A GLboolean specifying whether integer data values should be normalized into a certain range when being cast to a float.
     * * For types gl.BYTE and gl.SHORT, normalizes the values to [-1, 1] if true.
     * * For types gl.UNSIGNED_BYTE and gl.UNSIGNED_SHORT, normalizes the values to [0, 1] if true.
     * * For types gl.FLOAT and gl.HALF_FLOAT, this parameter has no effect.
     * @param stride A GLsizei specifying the offset in bytes between the beginning of consecutive vertex attributes. Cannot be larger than 255. If stride is 0, the attribute is assumed to be tightly packed, that is, the attributes are not interleaved but each attribute is in a separate block, and the next vertex' attribute follows immediately after the current vertex.
     * @param offset A GLintptr specifying an offset in bytes of the first component in the vertex attribute array. Must be a multiple of the byte length of type.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
     */
    vertexAttribPointer(index: GLuint, size: 1 | 2 | 3 | 4, type: VertexAttributeTypes, normalized: GLboolean, stride: GLsizei, offset: GLintptr): void
    {
        const { gl } = this._webGLRenderer;
        gl.vertexAttribPointer(index, size, gl[type], normalized, stride, offset);
    }

    /**
     * The WebGLRenderingContext.viewport() method of the WebGL API sets the viewport, which specifies the affine transformation of x and y from normalized device coordinates to window coordinates.
     *
     * @param x A GLint specifying the horizontal coordinate for the lower left corner of the viewport origin. Default value: 0.
     * @param y A GLint specifying the vertical coordinate for the lower left corner of the viewport origin. Default value: 0.
     * @param width A non-negative GLsizei specifying the width of the viewport. Default value: width of the canvas.
     * @param height A non-negative GLsizei specifying the height of the viewport. Default value: height of the canvas.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport
     */
    viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void
    {
        const { gl } = this._webGLRenderer;
        gl.viewport(x, y, width, height);
    }
}
