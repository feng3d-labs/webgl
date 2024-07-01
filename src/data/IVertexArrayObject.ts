import { IIndexBuffer } from "./IIndexBuffer";
import { IVertexAttributes } from "./IVertexAttributes";

export interface IVertexArrayObject
{
    /**
     * 顶点索引缓冲
     */
    index?: IIndexBuffer;

    /**
     * 顶点属性数据列表
     */
    vertices: IVertexAttributes;
}