/**
 * 根据顶点数据绘制图元。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawVertex
 */
export interface IGLDrawVertex
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
