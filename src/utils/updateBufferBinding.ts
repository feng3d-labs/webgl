import { TypedArray, UnReadonly } from "@feng3d/render-api";
import { watcher } from "@feng3d/watcher";
import { IUniformBlockInfo } from "../caches/getGLProgram";
import { IGLUniformBufferType } from "../const/IGLUniformType";
import { getIGLBuffer } from "../runs/getIGLBuffer";

/**
 * 
 * @param uniformBlock 
 * @param uniformData 
 * 
 * @see https://learnopengl-cn.readthedocs.io/zh/latest/04%20Advanced%20OpenGL/08%20Advanced%20GLSL/#uniform_1
 */
export function updateBufferBinding(uniformBlock: IUniformBlockInfo, uniformData: IBufferBinding)
{
    const size = uniformBlock.dataSize;
    // 是否存在默认值。
    const hasDefautValue = !!uniformData.bufferView;
    if (!hasDefautValue)
    {
        (uniformData as UnReadonly<IBufferBinding>).bufferView = new Uint8Array(size);
    }

    const buffer = getIGLBuffer(uniformData.bufferView);
    (buffer as any).label = buffer.label || (`BufferBinding ${uniformBlock.name}`);
    const offset = uniformData.bufferView.byteOffset;
    let currentSize = 0;

    uniformBlock.uniforms.forEach((uniformInfo) =>
    {
        const uniformBufferType = uniformInfo.type as IGLUniformBufferType;
        const alignSize = uniformBufferTypeAlignSizeMap[uniformBufferType];
        console.assert(alignSize, `没有找到 ${uniformBufferType} 统一缓冲类型对应的对齐与尺寸。`);

        uniformInfo.items.forEach((itemInfo) =>
        {
            currentSize = roundUp(alignSize.align, currentSize); // 单项对齐
            itemInfo.offset = currentSize;
            itemInfo.size = alignSize.size;
            //
            currentSize += alignSize.size;
            //
            const paths = itemInfo.paths;
            const update = () =>
            {
                let value: any;
                for (let i = 0; i < paths.length; i++)
                {
                    value = uniformData[paths[i]];
                    if (value === undefined) return;
                }

            }

            update();
            watcher.watchchain(uniformData, itemInfo.paths.join("."), update, undefined, false);
        });
    });
    currentSize = roundUp(4, currentSize); // 整个数据对齐
}

function roundUp(k: number, n: number): number
{
    return Math.ceil(n / k) * k;
}

/**
 * 缓冲区绑定。
 */
export interface IBufferBinding
{
    [name: string]: TypedArray | ArrayLike<number> | number;

    /**
     * 如果未设置引擎将自动生成。
     */
    readonly bufferView?: TypedArray;
}

/**
 * 
 * @see https://github.com/brendan-duncan/wgsl_reflect/blob/main/src/wgsl_reflect.ts#L1206
 * @see https://www.orillusion.com/zh/wgsl.html#memory-layouts
 */
const uniformBufferTypeAlignSizeMap: { [key: string]: { align: number, size: number } } = {
    "FLOAT": { align: 4, size: 4 },
    "FLOAT_VEC2": { align: 8, size: 8 },
    "FLOAT_VEC3": { align: 16, size: 12 },
    "FLOAT_VEC4": { align: 16, size: 16 },
    "INT": { align: 4, size: 4 },
    "INT_VEC2": { align: 8, size: 8 },
    "INT_VEC3": { align: 16, size: 12 },
    "INT_VEC4": { align: 16, size: 16 },
    "BOOL": { align: 4, size: 4 },
    "BOOL_VEC2": { align: 8, size: 8 },
    "BOOL_VEC3": { align: 16, size: 12 },
    "BOOL_VEC4": { align: 16, size: 16 },
    "FLOAT_MAT2": { align: 8, size: 16 },
    "FLOAT_MAT3": { align: 16, size: 48 },
    "FLOAT_MAT4": { align: 16, size: 64 },
    "UNSIGNED_INT": { align: 4, size: 4 },
    "UNSIGNED_INT_VEC2": { align: 8, size: 8 },
    "UNSIGNED_INT_VEC3": { align: 16, size: 12 },
    "UNSIGNED_INT_VEC4": { align: 16, size: 16 },
    "FLOAT_MAT2x3": { align: 16, size: 32 },
    "FLOAT_MAT2x4": { align: 16, size: 32 },
    "FLOAT_MAT3x2": { align: 8, size: 24 },
    "FLOAT_MAT3x4": { align: 16, size: 48 },
    "FLOAT_MAT4x2": { align: 8, size: 32 },
    "FLOAT_MAT4x3": { align: 16, size: 64 },
};