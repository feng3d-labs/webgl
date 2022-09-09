import { WebGLBufferSourceTypes } from '@feng3d/polyfill';
import { AttributeUsage } from '../gl/enums/AttributeUsage';
import { GLArrayType } from '../gl/enums/GLArrayType';
import { GL } from '../gl/GL';
import { WebGLRenderer } from '../WebGLRenderer';

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

    invalidate()
    {
        this._invalid = true;
    }

    /**
     * 数据类型，gl.UNSIGNED_BYTE、gl.UNSIGNED_SHORT
     */
    type = GLArrayType.UNSIGNED_INT;

    /**
     * 索引偏移
     */
    offset = 0;

    /**
     * 是否失效
     */
    private _invalid = true;

    /**
     * 激活缓冲
     * @param gl
     */
    active(gl: GL)
    {
        const buffer = Index.getBuffer(gl, this);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }

    /**
     * 获取缓冲
     */
    static getBuffer(gl: GL, index: Index)
    {
        if (index._invalid)
        {
            this.clear(index);
            index._invalid = false;
        }
        let buffer = gl.cache.indices.get(index);
        if (!buffer)
        {
            buffer = gl.createBuffer();
            if (!buffer)
            {
                console.error('createBuffer 失败！');
                throw '';
            }
            gl.cache.indices.set(index, buffer);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(index.array), gl.STATIC_DRAW);
        }

        return buffer;
    }

    /**
     * 清理缓冲
     */
    static clear(index: Index)
    {
        WebGLRenderer.glList.forEach((gl) =>
        {
            const buffer = gl.cache.indices.get(index);
            if (buffer)
            {
                gl.deleteBuffer(buffer);
                gl.cache.indices.delete(index);
            }
        });
    }
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
