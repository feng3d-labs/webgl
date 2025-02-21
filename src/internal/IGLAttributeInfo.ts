import { IGLVertexAttributeTypes } from "@feng3d/render-api";

export interface IGLAttributeInfo
{
    /**
     * 名称。
     */
    name: string;

    /**
     * 顶点尺寸。
     */
    size: number;

    /**
     * 属性缓冲数据类型
     */
    type?: IGLVertexAttributeTypes;

    /**
     * 属性地址
     */
    location: number;
}
