import { } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    /**
     * WebGL缓冲区
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    export interface GBuffer
    {
        /**
         * WebGL缓冲区目标。
         */
        target: BufferTarget;

        /**
         * 为优化目的指定数据存储的预期使用模式的GLenum。
         *
         * 默认为 "STATIC_DRAW"。
         */
        usage?: BufferUsage;
    }
}

/**
 * WebGL元素缓冲数据类型。
 *
 * A GLenum specifying the type of the values in the element array buffer. Possible values are:
 *
 * * gl.UNSIGNED_BYTE
 * * gl.UNSIGNED_SHORT
 *
 * When using the OES_element_index_uint extension:
 *
 * * gl.UNSIGNED_INT
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/drawElements
 */
export type DrawElementType = "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "UNSIGNED_INT";

/**
 * WebGL缓冲区使用模式。
 * 
 * A GLenum specifying the intended usage pattern of the data store for optimization purposes. Possible values:
 *
 * * gl.STATIC_DRAW: The contents are intended to be specified once by the application, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.DYNAMIC_DRAW: The contents are intended to be respecified repeatedly by the application, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.STREAM_DRAW: The contents are intended to be specified once by the application, and used at most a few times as the source for WebGL drawing and image specification commands.
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.STATIC_READ     The contents are intended to be specified once by reading data from WebGL, and queried many times by the application.
 * * gl.DYNAMIC_READ    The contents are intended to be respecified repeatedly by reading data from WebGL, and queried many times by the application.
 * * gl.STREAM_READ     The contents are intended to be specified once by reading data from WebGL, and queried at most a few times by the application
 * * gl.STATIC_COPY     The contents are intended to be specified once by reading data from WebGL, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.DYNAMIC_COPY    The contents are intended to be respecified repeatedly by reading data from WebGL, and used many times as the source for WebGL drawing and image specification commands.
 * * gl.STREAM_COPY     The contents are intended to be specified once by reading data from WebGL, and used at most a few times as the source for WebGL drawing and image specification commands.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export type BufferUsage = "STATIC_DRAW" | "DYNAMIC_DRAW" | "STREAM_DRAW" // WebGL1
    | "STATIC_READ" | "DYNAMIC_READ" | "STREAM_READ" | "STATIC_COPY" | "DYNAMIC_COPY" | "STREAM_COPY" // WebGL2
    ;

/**
 * WebGL缓冲区目标。
 * 
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
