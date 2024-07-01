import { IBuffer } from "./IBuffer";

/**
 * 顶点属性数据。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribIPointer
 */
export interface IVertexAttribute
{
    /**
     * WebGL缓冲区
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    buffer: IBuffer;

    /**
     * 顶点数据元素数量。
     */
    numComponents: 1 | 2 | 3 | 4;

    /**
     * 是否标准化。
     */
    normalized?: boolean;

    /**
     * drawElementsInstanced时将会用到的因子，表示divisor个geometry共用一个数据
     *
     * A GLuint specifying the number of instances that will pass between updates of the generic attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays/vertexAttribDivisorANGLE
     */
    divisor?: number;

    /**
     * 所在顶点数据中的偏移字节数。
     */
    offset?: number;

    /**
     * 单个顶点数据尺寸。比如单个数据包含position与uv那么值可能为(3+2)*4=20。
     */
    vertexSize?: number;
}

/**
 * 属性缓冲数据类型
 *
 * A GLenum specifying the data type of each component in the array. Possible values:
 *
 * * gl.BYTE: signed 8-bit integer, with values in [-128, 127]
 * * gl.SHORT: signed 16-bit integer, with values in [-32768, 32767]
 * * gl.UNSIGNED_BYTE: unsigned 8-bit integer, with values in [0, 255]
 * * gl.UNSIGNED_SHORT: unsigned 16-bit integer, with values in [0,65535]
 * * gl.FLOAT: 32-bit IEEE floating point number
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.HALF_FLOAT: 16-bit IEEE floating point number
 * * gl.INT: 32-bit signed binary integer
 * * gl.UNSIGNED_INT: 32-bit unsigned binary integer
 * * gl.INT_2_10_10_10_REV: 32-bit signed integer with values in [-512, 511]
 * * gl.UNSIGNED_INT_2_10_10_10_REV: 32-bit unsigned integer with values in [0, 1023]
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 */
export type VertexAttributeTypes = "FLOAT" | "BYTE" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" // WebGL1
    | "HALF_FLOAT" | "INT" | "UNSIGNED_INT" | "INT_2_10_10_10_REV" | "UNSIGNED_INT_2_10_10_10_REV"; // WebGL2

/**
 * A GLenum specifying the data type of each component in the array. Must be one of:
 * * gl.BYTE
 * * gl.UNSIGNED_BYTE
 * * gl.SHORT
 * * gl.UNSIGNED_SHORT
 * * gl.INT
 * * gl.UNSIGNED_INT.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribIPointer
 */
export type VertexAttributeIntegerTypes = "BYTE" | "UNSIGNED_BYTE" | "SHORT" | "UNSIGNED_SHORT" | "INT" | "UNSIGNED_INT";
