import { IGLIndexBuffer } from "./IGLIndexBuffer";
import { IGLVertexAttributes } from "./IGLVertexAttributes";

export interface IGLVertexArrayObject
{
    /**
     * 顶点索引缓冲
     */
    index?: IGLIndexBuffer;

    /**
     * 顶点属性数据列表
     */
    vertices: IGLVertexAttributes;
}