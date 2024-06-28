import { IDepthStencilState } from "./IDepthStencilState";
import { IPrimitiveState } from "./IPrimitiveState";

/**
 * shader
 */
export interface IWebGLRenderPipeline
{
    /**
     * 顶点着色器代码
     */
    vertex: string;

    /**
     * 片段着色器代码
     */
    fragment: string;

    /**
     * 图元拓扑结构。
     */
    primitive?: IPrimitiveState;

    /**
     * 描述可选的深度模板的测试、运算以及偏差。
     */
    depthStencil?: IDepthStencilState;
}
