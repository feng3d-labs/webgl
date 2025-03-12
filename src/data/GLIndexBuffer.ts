import { Buffer, IIndicesDataTypes } from "@feng3d/render-api";

/**
 * WebGL 顶点索引缓冲。
 *
 * 使用 gl.ELEMENT_ARRAY_BUFFER 进行绑定数据。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 *
 */
export interface GLIndexBuffer extends Buffer
{
    target: "ELEMENT_ARRAY_BUFFER";

    /**
     * 顶点索引数据。
     */
    data?: IIndicesDataTypes;
}