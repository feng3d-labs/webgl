import { IBuffer, IIndicesDataTypes, IVertexDataTypes, TypedArray } from "@feng3d/render-api";
import { IGLBufferTarget, IGLBufferUsage, IGLIndexBuffer, IGLVertexBuffer } from "../data/IGLBuffer";

export function getIGLBuffer(data: TypedArray, target?: IGLBufferTarget, usage: IGLBufferUsage = "STATIC_DRAW")
{
    if (data[_IGLBuffer]) return data[_IGLBuffer];

    console.assert(!!target, `初始化时不能为空，可能该数据的渲染对象还未被渲染！`);

    const indexBuffer: IBuffer = {
        size: data.byteLength,
        target: target,
        usage: usage,
        data: data,
    };
    data[_IGLBuffer] = indexBuffer;

    return indexBuffer;
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