import { WebGLBufferSourceTypes } from '@feng3d/polyfill';
import { AttributeUsage } from '../gl/WebGLEnums';

/**
 * 指定元素数组缓冲区中的值的类型。
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/drawElements
 */
export type DrawElementType = 'UNSIGNED_BYTE' | 'UNSIGNED_SHORT' | 'UNSIGNED_INT';

/**
 * WebGL顶点索引的缓冲
 *
 * 使用 gl.ELEMENT_ARRAY_BUFFER 进行绑定数据。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 *
 */
export class ElementBuffer
{
    /**
     * 数据
     */
    array: WebGLBufferSourceTypes;

    /**
     * A GLenum specifying the intended usage pattern of the data store for optimization purposes.
     *
     * 为优化目的指定数据存储的预期使用模式的GLenum。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    usage: AttributeUsage = 'STATIC_DRAW';

    /**
     * 指定元素数组缓冲区中的值的类型，默认为`UNSIGNED_SHORT`。
     *
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/drawElements
     */
    type: DrawElementType;

    /**
     * 版本号，用于标记是否变化。
     */
    version = 0;

    constructor(array: WebGLBufferSourceTypes)
    {
        if (Array.isArray(array))
        {
            throw new TypeError('AttributeBuffer: array should be a Typed Array.');
        }

        this.array = array;
    }
}
