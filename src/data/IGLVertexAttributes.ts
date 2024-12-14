import { IGLVertexAttributeTypes } from "../runs/runVertexAttribute";
import { IGLBuffer } from "./IGLBuffer";

/**
 * 顶点属性数据。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribIPointer
 */
export interface IGLVertexAttribute
{
    /**
     * 顶点属性数据。
     */
    data: IVertexDataTypes;

    /**
     * 顶点数据元素数量。
     */
    numComponents: 1 | 2 | 3 | 4;

    /**
     * 属性缓冲数据类型
     *
     * 默认从Buffer数据中获取，如果未取到则默认为 "FLOAT" 。
     */
    type?: IGLVertexAttributeTypes;

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

export interface IGLVertexBuffer extends IGLBuffer
{
    target: "ARRAY_BUFFER";

    /**
     * 缓冲区数据。
     */
    data?: IVertexDataTypes;
}

/**
 * 顶点属性数据类型。
 */
export type IVertexDataTypes =
    | Float32Array
    | Uint32Array
    | Int32Array
    | Uint16Array
    | Int16Array | Uint8ClampedArray
    | Uint8Array
    | Int8Array;

