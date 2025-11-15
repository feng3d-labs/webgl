import { Buffer } from '@feng3d/render-api';

export function getIGLBuffer(data: ArrayBufferLike): Buffer
{
    if (data[_IGLBuffer]) return data[_IGLBuffer];

    const buffer: Buffer = {
        size: Math.ceil(data.byteLength / 4) * 4,
        data: data,
    };
    data[_IGLBuffer] = buffer;

    return buffer;
}

const _IGLBuffer = '_IGLBuffer';