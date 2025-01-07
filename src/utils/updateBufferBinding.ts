import { TypedArray, UnReadonly } from "@feng3d/render-api";
import { IUniformBlockInfo } from "../caches/getGLProgram";

export function updateBufferBinding(uniformBlock: IUniformBlockInfo, uniformData: IBufferBinding)
{
    const size = uniformBlock.dataSize;
    // 是否存在默认值。
    const hasDefautValue = !!uniformData.bufferView;
    if (!hasDefautValue)
    {
        (uniformData as UnReadonly<IBufferBinding>).bufferView = new Uint8Array(size);
    }

    // const buffer = getIGLBuffer(uniformData.bufferView);
    // (buffer as any).label = buffer.label || (`BufferBinding ${variableInfo.name}`);
    // const offset = uniformData.bufferView.byteOffset;


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
