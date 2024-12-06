import { GLBufferTarget, GLBufferUsage, IGLBuffer } from "../data/IGLBuffer";
import { IGLIndicesDataTypes, IGLIndexBuffer } from "../data/IGLIndexBuffer";
import { IGLVertexDataTypes, IGLVertexBuffer } from "../data/IGLVertexAttributes";

export function getIGLBuffer(data: BufferSource, target?: GLBufferTarget, usage: GLBufferUsage = "STATIC_DRAW")
{
    if (data[_IGLBuffer]) return data[_IGLBuffer];

    console.assert(target, `初始化时不能为空，请使用 getIGLIndexBuffer getIGLVertexBuffer 等进行特定类型初始化！`);

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