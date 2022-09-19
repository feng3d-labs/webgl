import { WebGLBufferSourceTypes } from '@feng3d/polyfill';
import { AttributeUsage } from '../gl/WebGLEnums';

/**
 * WebGL元素索引的缓冲
 *
 * 使用 gl.ELEMENT_ARRAY_BUFFER 进行绑定数据。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer
 *
 */
export class ElementArrayBuffer
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
     * 版本号，用于标记是否变化。
     */
    version = 0;

    constructor(array: WebGLBufferSourceTypes)
    {
        if (Array.isArray(array))
        {
            throw new TypeError('AttributeArrayBuffer: array should be a Typed Array.');
        }

        this.array = array;
    }

    needsUpdate()
    {
        this.version++;
    }
}
