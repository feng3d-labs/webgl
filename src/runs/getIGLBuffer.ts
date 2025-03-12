import { Buffer, TypedArray } from "@feng3d/render-api";
import { BufferTarget, BufferUsage } from "../data/polyfills/Buffer";

export function getIGLBuffer(data: TypedArray, target?: BufferTarget, usage: BufferUsage = "STATIC_DRAW"): Buffer
{
    if (data[_IGLBuffer]) return data[_IGLBuffer];

    const buffer: Buffer = {
        size: Math.ceil(data.byteLength / 4) * 4,
        target,
        usage,
        data,
    };
    data[_IGLBuffer] = buffer;

    return buffer;
}

const _IGLBuffer = "_IGLBuffer";