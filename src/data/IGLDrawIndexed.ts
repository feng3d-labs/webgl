/**
 * 根据索引数据绘制图元。
 */
export interface IGLDrawIndexed
{
    /**
     * 默认渲染所有顶点索引。
     */
    indexCount?: number;
    instanceCount?: number;
    firstIndex?: number;
}