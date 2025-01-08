import { UnReadonly } from "@feng3d/render-api";
import { watcher } from "@feng3d/watcher";
import { IUniformBlockInfo } from "../caches/getGLProgram";
import { IGLUniformBufferType } from "../const/IGLUniformType";
import { IBufferBinding } from "../data/IGLUniforms";
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
    if (uniformData["_uniformBlock"] !== undefined)
    {
        const preVariableInfo = uniformData["_uniformBlock"] as any as IUniformBlockInfo;
        if (preVariableInfo.name !== uniformBlock.name
            || preVariableInfo.dataSize !== uniformBlock.dataSize
        )
        {
            console.warn(`updateBufferBinding 出现一份数据对应多个 variableInfo`, { uniformData, uniformBlock, preVariableInfo });
        }

        return;
    }

    uniformData["_uniformBlock"] = uniformBlock as any;

    const size = uniformBlock.dataSize;
    // 是否存在默认值。
    const hasDefautValue = !!uniformData.bufferView;
    if (!hasDefautValue)
    {
        (uniformData as UnReadonly<IBufferBinding>).bufferView = new Uint8Array(size);
    }
    else
    {
        console.assert(uniformData.bufferView.byteLength === size, `uniformData.bufferView 统一块数据提供数据尺寸不对！`);
    }

    const buffer = getIGLBuffer(uniformData.bufferView);
    (buffer as any).label = buffer.label || (`BufferBinding ${uniformBlock.name}`);
    const offset = uniformData.bufferView.byteOffset;
    let currentSize = 0;
    let structName: string;

    uniformBlock.uniforms.forEach((uniformInfo) =>
    {
        const uniformBufferType = uniformInfo.type as IGLUniformBufferType;
        const alignSize = uniformBufferTypeAlignSizeMap[uniformBufferType];
        console.assert(alignSize, `没有找到 ${uniformBufferType} 统一缓冲类型对应的对齐与尺寸。`);

        //
        const currentstructName = uniformInfo.name.substring(0, uniformInfo.name.lastIndexOf("."));
        if (structName !== currentstructName)
        {
            currentSize = roundUp(16, currentSize); // 结构体之间对齐
            structName = currentstructName;
        }

        //
        uniformInfo.items.forEach((itemInfo) =>
        {
            currentSize = roundUp(alignSize.align, currentSize); // 结构体成员对齐
            const itemInfoOffset = currentSize;
            const itemInfoSize = alignSize.size;
            //
            currentSize += alignSize.size;
            const Cls = alignSize.clsType;
            //
            const paths = itemInfo.paths.slice(1);
            const update = () =>
            {
                let value: any = uniformData;
                for (let i = 0; i < paths.length; i++)
                {
                    value = value[paths[i]];
                    if (value === undefined)
                    {
                        if (!hasDefautValue)
                        {
                            console.warn(`没有找到 统一块变量属性 ${paths.join(".")} 的值！`);
                        }
                        return;
                    }
                }

                let data: Float32Array | Int32Array | Uint32Array;
                if (typeof value === "number")
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
                buffer.writeBuffers = writeBuffers;
            }

            update();
            watcher.watchchain(uniformData, paths.join("."), update, undefined, false);
        });
    });
    currentSize = roundUp(16, currentSize); // 整个统一块数据对齐

    console.assert(size === currentSize, `uniformBlock映射尺寸出现错误( ${size}  ${currentSize} )！`);
}

function roundUp(k: number, n: number): number
{
    return Math.ceil(n / k) * k;
}

/**
 * 
 * @see https://github.com/brendan-duncan/wgsl_reflect/blob/main/src/wgsl_reflect.ts#L1206
 * @see https://www.orillusion.com/zh/wgsl.html#memory-layouts
 */
const uniformBufferTypeAlignSizeMap: {
    [key: string]: {
        align: number,
        size: number,
        clsType: Float32ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor,
    }
} = {
    "FLOAT": { align: 4, size: 4, clsType: Float32Array },
    "FLOAT_VEC2": { align: 8, size: 8, clsType: Float32Array },
    "FLOAT_VEC3": { align: 16, size: 12, clsType: Float32Array },
    "FLOAT_VEC4": { align: 16, size: 16, clsType: Float32Array },
    "INT": { align: 4, size: 4, clsType: Int32Array },
    "INT_VEC2": { align: 8, size: 8, clsType: Int32Array },
    "INT_VEC3": { align: 16, size: 12, clsType: Int32Array },
    "INT_VEC4": { align: 16, size: 16, clsType: Int32Array },
    "BOOL": { align: 4, size: 4, clsType: Int32Array },
    "BOOL_VEC2": { align: 8, size: 8, clsType: Int32Array },
    "BOOL_VEC3": { align: 16, size: 12, clsType: Int32Array },
    "BOOL_VEC4": { align: 16, size: 16, clsType: Int32Array },
    "FLOAT_MAT2": { align: 8, size: 16, clsType: Float32Array },
    "FLOAT_MAT3": { align: 16, size: 48, clsType: Float32Array },
    "FLOAT_MAT4": { align: 16, size: 64, clsType: Float32Array },
    "UNSIGNED_INT": { align: 4, size: 4, clsType: Uint32Array },
    "UNSIGNED_INT_VEC2": { align: 8, size: 8, clsType: Uint32Array },
    "UNSIGNED_INT_VEC3": { align: 16, size: 12, clsType: Uint32Array },
    "UNSIGNED_INT_VEC4": { align: 16, size: 16, clsType: Uint32Array },
    "FLOAT_MAT2x3": { align: 16, size: 32, clsType: Float32Array },
    "FLOAT_MAT2x4": { align: 16, size: 32, clsType: Float32Array },
    "FLOAT_MAT3x2": { align: 8, size: 24, clsType: Float32Array },
    "FLOAT_MAT3x4": { align: 16, size: 48, clsType: Float32Array },
    "FLOAT_MAT4x2": { align: 8, size: 32, clsType: Float32Array },
    "FLOAT_MAT4x3": { align: 16, size: 64, clsType: Float32Array },
};