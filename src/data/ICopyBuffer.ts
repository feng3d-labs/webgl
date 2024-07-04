import { IBuffer } from "./IBuffer";

export interface ICopyBuffer
{
    read: IBuffer,
    write: IBuffer,
    readOffset: number
    writeOffset: number
    size: number
}