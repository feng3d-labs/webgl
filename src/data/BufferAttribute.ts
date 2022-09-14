import { WebGLBufferSourceTypes } from '@feng3d/polyfill';
import { watcher } from '@feng3d/watcher';
import { AttributeUsage } from '../gl/WebGLEnums';

/**
 * 索引渲染数据
 */
export class BufferAttribute
{
    name: string;

    /**
     * 数据
     */
    array: WebGLBufferSourceTypes;

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
     * 数据数量
     */
    count: number;

    /**
     * A GLenum specifying the intended usage pattern of the data store for optimization purposes.
     *
     * 为优化目的指定数据存储的预期使用模式的GLenum。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
     */
    usage: AttributeUsage = 'STATIC_DRAW';

    /**
     * 更新范围。
     */
    updateRange = { offset: 0, count: -1 };

    /**
     * 版本号，用于标记是否变化。
     */
    version = 0;

    constructor(array: WebGLBufferSourceTypes, itemSize: number, normalized?: boolean, divisor = 0)
    {
        if (Array.isArray(array))
        {
            throw new TypeError('BufferAttribute: array should be a Typed Array.');
        }

        this.array = array;
        this.itemSize = itemSize;
        this.count = array !== undefined ? array.length / itemSize : 0;
        this.normalized = normalized === true;
        this.divisor = divisor;

        //
        watcher.watch(this as BufferAttribute, 'array', this.needsUpdate, this);
    }

    needsUpdate()
    {
        const { array, itemSize } = this;

        this.version++;
        this.count = array !== undefined ? array.length / itemSize : 0;
    }
}
