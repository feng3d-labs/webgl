import { reactive, UnReadonly } from '@feng3d/reactivity';
import { BufferBinding, BufferBindingInfo } from '@feng3d/render-api';
import { watcher } from '@feng3d/watcher';
import { getIGLBuffer } from '../runs/getIGLBuffer';

/**
 *
 * @param uniformBlock
 * @param uniformData
 *
 * @see https://learnopengl-cn.readthedocs.io/zh/latest/04%20Advanced%20OpenGL/08%20Advanced%20GLSL/#uniform_1
 */
// 在文件顶部添加Map声明
const bufferBindingInfoMap = new WeakMap<BufferBinding, BufferBindingInfo>();

export function updateBufferBinding(bufferBindingInfo: BufferBindingInfo, uniformData: BufferBinding)
{
    // 使用Map替代属性访问
    if (bufferBindingInfoMap.has(uniformData))
    {
        const preVariableInfo = bufferBindingInfoMap.get(uniformData);
        if (preVariableInfo.size !== bufferBindingInfo.size)
        {
            console.warn(`updateBufferBinding 出现一份数据对应多个 variableInfo`, { uniformData, bufferBindingInfo, preVariableInfo });
        }

        return;
    }

    // 使用Map存储数据
    bufferBindingInfoMap.set(uniformData, bufferBindingInfo);

    const size = bufferBindingInfo.size;
    // 是否存在默认值。
    const hasDefautValue = !!uniformData.bufferView;
    if (!hasDefautValue)
    {
        (uniformData as UnReadonly<BufferBinding>).bufferView = new Uint8Array(size);
    }
    else
    {
        console.assert(uniformData.bufferView.byteLength === size, `uniformData.bufferView 统一块数据提供数据尺寸不对！`);
    }

    //
    const buffer = getIGLBuffer(uniformData.bufferView.buffer);
    const offset = uniformData.bufferView.byteOffset;

    //
    bufferBindingInfo.items.forEach((v) =>
    {
        const { paths, offset: itemInfoOffset, size: itemInfoSize, Cls } = v;
        const update = () =>
        {
            let value: any = uniformData.value;
            if (value === undefined) return;

            for (let i = 0; i < paths.length; i++)
            {
                value = value[paths[i]];
                if (value === undefined)
                {
                    if (!hasDefautValue)
                    {
                        console.warn(`没有找到 统一块变量属性 ${paths.join('.')} 的值！`);
                    }

                    return;
                }
            }

            let data: Int16Array | Int32Array | Uint32Array | Float32Array;
            if (typeof value === 'number')
            {
                data = new Cls([value]);
            }
            else if (value.constructor.name !== Cls.name)
            {
                data = new Cls(value as ArrayLike<number>);
            }
            else
            {
                data = value as any;
            }

            const writeBuffers = buffer.writeBuffers ?? [];
            writeBuffers.push({ data: data.buffer, bufferOffset: offset + itemInfoOffset, size: Math.min(itemInfoSize, data.byteLength) });
            reactive(buffer).writeBuffers = writeBuffers;
        };

        update();
        watcher.watchchain(uniformData, paths.join('.'), update, undefined, false);
    });
}
