import { IElementBufferSourceTypes } from "./IGLIndexBuffer";
import { IGLVertexAttributes } from "./IGLVertexAttributes";

export interface IGLVertexArrayObject
{

    /**
     * 顶点属性数据列表
     */
    vertices: IGLVertexAttributes;
}