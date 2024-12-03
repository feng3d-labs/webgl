import { IGLBuffer } from "./IGLBuffer";

export interface IGLCopyBuffer
{
    read: IGLBuffer,
    write: IGLBuffer,
    readOffset: number
    writeOffset: number
    size: number
}