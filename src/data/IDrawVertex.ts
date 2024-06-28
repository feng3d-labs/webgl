/**
 * 绘制指定数量的顶点。
 */
export interface IDrawVertex
{
    /**
     * 绘制顶点数量。
     */
    vertexCount?: number;
    /**
     * 渲染实例数量
    */
    instanceCount?: number;
    /**
     * 第一个顶点索引。
     */
    firstVertex?: number;
}
