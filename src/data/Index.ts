import { WebGLBufferSourceTypes } from '@feng3d/polyfill';
import { AttributeUsage } from '../gl/enums/AttributeUsage';
import { GLArrayType } from '../gl/enums/GLArrayType';

/**
 * 索引渲染数据
 */
export class Index
{
    /**
     * 数据
     */
    array: WebGLBufferSourceTypes;

    /**
     * 单项数据尺寸。
     */
    itemSize: number;

    /**
     * 数据数量
     */
    count: number;

    /**
     * 是否标准化。
     */
    normalized: boolean;

    /**
     * A GLenum specifying the intended usage pattern of the data store for optimization purposes.
     *
     * 为优化目的指定数据存储的预期使用模式的GLenum。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    usage = AttributeUsage.STATIC_DRAW;

    /**
     * 更新范围。
     */
    updateRange = { offset: 0, count: -1 };

    /**
     * 版本号，用于标记是否变化。
     */
    version = 0;

    constructor(array: WebGLBufferSourceTypes, itemSize: number, normalized?: boolean)
    {
        this.array = array;
        this.itemSize = itemSize;
        this.count = array !== undefined ? array.length / itemSize : 0;
        this.normalized = normalized === true;
    }

    /**
     * 数据类型，gl.UNSIGNED_BYTE、gl.UNSIGNED_SHORT
     */
    type = GLArrayType.UNSIGNED_INT;

    /**
     * 索引偏移
     */
    offset = 0;
}

export class Uint16BufferAttribute extends Index
{
    constructor(array: ArrayLike<number> | ArrayBufferLike | number, itemSize: number, normalized?: boolean)
    {
        super(new Uint16Array(array as any), itemSize, normalized);
    }
}

export class Int32BufferAttribute extends Index
{
    constructor(array: ArrayLike<number> | ArrayBufferLike | number, itemSize: number, normalized?: boolean)
    {
        super(new Int32Array(array as any), itemSize, normalized);
    }
}
