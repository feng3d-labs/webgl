import { Buffer, IIndicesDataTypes, IVertexDataTypes, TypedArray } from "@feng3d/render-api";
import { GLIndexBuffer } from "../data/GLIndexBuffer";
import { GLUniformBuffer } from "../data/GLUniformBuffer";
import { GLVertexBuffer } from "../data/GLVertexBuffer";
import { IGLBufferTarget, IGLBufferUsage } from "../data/polyfills/Buffer";

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
    const vertexBuffer: GLUniformBuffer = data[_IGLBuffer] = data[_IGLBuffer] || getIGLBuffer(data, "UNIFORM_BUFFER", usage);
    vertexBuffer.target = vertexBuffer.target || "UNIFORM_BUFFER";

    return vertexBuffer;
}

export function getIGLVertexBuffer(data: IVertexDataTypes, usage?: "STREAM_COPY")
{
    const vertexBuffer: GLVertexBuffer = data[_IGLBuffer] = data[_IGLBuffer] || getIGLBuffer(data, "ARRAY_BUFFER", usage);

    return vertexBuffer;
}

export function getIGLIndexBuffer(indices: IIndicesDataTypes)
{
    const indexBuffer: GLIndexBuffer = indices[_IGLBuffer] = indices[_IGLBuffer] || getIGLBuffer(indices, "ELEMENT_ARRAY_BUFFER");

    return indexBuffer;
}

const _IGLBuffer = "IGLBuffer";