import { AttributeUsage } from '../gl/WebGLEnums';

/**
 * 属性缓冲数据类型。
 */
export type AttributeBufferSourceTypes = number[]
    | Float64Array
    | Float32Array
    | Uint32Array
    | Int32Array
    | Uint16Array
    | Int16Array | Uint8ClampedArray
    | Uint8Array
    | Int8Array;

/**
 * 属性缓冲数据类型
 */
export type AttributeTypes = 'FLOAT' | 'UNSIGNED_SHORT' | 'SHORT' | 'UNSIGNED_INT' | 'INT' | 'BYTE' | 'UNSIGNED_BYTE' | 'UNSIGNED_BYTE';

/**
 * WebGL顶点属性缓冲
 */
export class AttributeBuffer
{
    /**
     * 数据
     */
    array: AttributeBufferSourceTypes;

    /**
     * 单项数据尺寸。
     */
    itemSize: number;

    /**
     * 是否标准化。
     */
    normalized: boolean;

    /**
     * drawElementsInstanced时将会用到的因子，表示divisor个geometry共用一个数据
     *
     * A GLuint specifying the number of instances that will pass between updates of the generic attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/ANGLE_instanced_arrays/vertexAttribDivisorANGLE
     */
    divisor = 0;

    /**
     * A GLenum specifying the intended usage pattern of the data store for optimization purposes.
     *
     * 为优化目的指定数据存储的预期使用模式的GLenum。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    usage: AttributeUsage = 'STATIC_DRAW';

    /**
     * 属性缓冲数据类型
     */
    type: AttributeTypes;

    /**
     * 版本号，用于标记是否变化。
     */
    version = 0;

    constructor(array: AttributeBufferSourceTypes, itemSize: number, normalized?: boolean, divisor = 0)
    {
        if (Array.isArray(array))
        {
            throw new TypeError('AttributeBuffer: array should be a Typed Array.');
        }

        this.array = array;
        this.itemSize = itemSize;
        this.divisor = divisor;
        this.normalized = normalized;
    }
}
