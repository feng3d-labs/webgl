import { GLBufferTarget, GLBufferUsage, IGLBuffer } from "../data/IGLBuffer";
import { IGLIndexBuffer, IGLIndicesDataTypes } from "../data/IGLIndexBuffer";
import { IGLVertexBuffer, IGLVertexDataTypes } from "../data/IGLVertexAttributes";

export function getIGLBuffer(data: BufferSource, target?: GLBufferTarget, usage: GLBufferUsage = "STATIC_DRAW")
{
    if (data[_IGLBuffer]) return data[_IGLBuffer];

    console.assert(!!target, `初始化时不能为空，可能该数据的渲染对象还未被渲染！`);

    const indexBuffer: IGLBuffer = data[_IGLBuffer] = {
        target: target, usage: usage,
        data: data,
    } as IGLBuffer;

    return indexBuffer;
}

export function getIGLVertexBuffer(data: IGLVertexDataTypes, usage?: "STREAM_COPY")
{
    const vertexBuffer: IGLVertexBuffer = data[_IGLBuffer] = data[_IGLBuffer] || getIGLBuffer(data, "ARRAY_BUFFER", usage);

    return vertexBuffer;
}

export function getIGLIndexBuffer(indices: IGLIndicesDataTypes)
{
    const indexBuffer: IGLIndexBuffer = indices[_IGLBuffer] = indices[_IGLBuffer] || getIGLBuffer(indices, "ELEMENT_ARRAY_BUFFER");

    return indexBuffer;
}

const _IGLBuffer = "IGLBuffer";