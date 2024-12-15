import { IIndicesDataTypes } from "@feng3d/render-api";
import { IGLBuffer } from "./IGLBuffer";

/**
 * WebGL元素缓冲，顶点索引缓冲。
 *
 * 使用 gl.ELEMENT_ARRAY_BUFFER 进行绑定数据。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 *
 */
export interface IGLIndexBuffer extends IGLBuffer
{
    target: "ELEMENT_ARRAY_BUFFER";

    /**
     * 顶点索引数据。
     */
    data: IIndicesDataTypes;
}

/**
 * 元素缓冲数据类型。
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
export type IGLDrawElementType = "UNSIGNED_BYTE" | "UNSIGNED_SHORT" | "UNSIGNED_INT";
