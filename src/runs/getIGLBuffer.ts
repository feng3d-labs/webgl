import { Buffer, IIndicesDataTypes, IVertexDataTypes, TypedArray } from "@feng3d/render-api";
import { IGLBufferTarget, IGLBufferUsage, IGLIndexBuffer, IGLUniformBuffer, IGLVertexBuffer } from "../data/IGLBuffer";

export function getIGLBuffer(data: TypedArray, target?: IGLBufferTarget, usage: IGLBufferUsage = "STATIC_DRAW"): Buffer
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

export function getIGLUniformBuffer(data: TypedArray, usage?: "DYNAMIC_DRAW")
{
    const vertexBuffer: IGLUniformBuffer = data[_IGLBuffer] = data[_IGLBuffer] || getIGLBuffer(data, "UNIFORM_BUFFER", usage);
    vertexBuffer.target = vertexBuffer.target || "UNIFORM_BUFFER";

    return vertexBuffer;
}

export function getIGLVertexBuffer(data: IVertexDataTypes, usage?: "STREAM_COPY")
{
    const vertexBuffer: IGLVertexBuffer = data[_IGLBuffer] = data[_IGLBuffer] || getIGLBuffer(data, "ARRAY_BUFFER", usage);

    return vertexBuffer;
}

export function getIGLIndexBuffer(indices: IIndicesDataTypes)
{
    const indexBuffer: IGLIndexBuffer = indices[_IGLBuffer] = indices[_IGLBuffer] || getIGLBuffer(indices, "ELEMENT_ARRAY_BUFFER");

    return indexBuffer;
}

const _IGLBuffer = "IGLBuffer";