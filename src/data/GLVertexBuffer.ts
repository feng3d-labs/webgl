import { Buffer, IVertexDataTypes } from "@feng3d/render-api";

/**
 * WebGL 顶点缓冲区。
 */
export interface GLVertexBuffer extends Buffer
{
    target: "ARRAY_BUFFER";

    /**
     * 缓冲区数据。
     */
    data?: IVertexDataTypes;
}
