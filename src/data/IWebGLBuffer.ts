import { BufferUsage } from "../gl/WebGLEnums";
import { AttributeBufferSourceTypes } from "./AttributeBuffer";

/**
 * WebGL缓冲区
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
 */
export interface IWebGLBuffer
{
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
