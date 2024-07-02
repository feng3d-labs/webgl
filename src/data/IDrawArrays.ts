/**
 * 绘制一定数量顶点。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays
 */
export interface IDrawArrays
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
