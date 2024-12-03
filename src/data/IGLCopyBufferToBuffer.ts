import { IGLBuffer } from "./IGLBuffer";

/**
 * GL缓冲区之间拷贝。
 *
 * {@link WebGL2RenderingContextBase.copyBufferSubData}
 */
export interface IGLCopyBufferToBuffer
{
    /**
     * 数据类型。
     */
    readonly __type: "IGLCopyBufferToBuffer";
    /**
     * 源缓冲区。
     */
    source: IGLBuffer,
    /**
     * 默认为0。
     */
    sourceOffset: number
    /**
     * 目标缓冲区。
     */
    destination: IGLBuffer,
    /**
     * 默认为0。
     */
    destinationOffset: number
    /**
     * 默认为源缓冲区尺寸。
     */
    size: number
}