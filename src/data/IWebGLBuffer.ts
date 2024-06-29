import { BufferUsage } from "../gl/WebGLEnums";
import { VertexAttributeTypes } from "./IVertexAttribute";

/**
 * WebGL缓冲区
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export interface IWebGLBuffer
{
    /**
     * 属性缓冲数据类型
     */
    type?: VertexAttributeTypes;

    /**
     * 缓冲区尺寸。
     */
    size?: number;

    /**
     * 缓冲区数据。
     */
    data?: AttributeBufferSourceTypes;

    /**
     * 为优化目的指定数据存储的预期使用模式的GLenum。
     */
    usage?: BufferUsage;
}

/**
 * 属性缓冲数据类型。
 */
export type AttributeBufferSourceTypes = number[]
    | Float32Array
    | Uint32Array
    | Int32Array
    | Uint16Array
    | Int16Array | Uint8ClampedArray
    | Uint8Array
    | Int8Array;