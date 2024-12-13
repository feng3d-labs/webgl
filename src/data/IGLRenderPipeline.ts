import { IBlendComponent, IBlendState, IColorTargetState, IRenderPipeline } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    /**
     * 渲染管线。
     */
    export interface IRenderPipeline
    {
        /**
         * 回写变量。
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/transformFeedbackVaryings
         */
        transformFeedbackVaryings?: ITransformFeedbackVaryings;

        /**
         * 是否丢弃后续光栅化阶段。
         *
         * gl.RASTERIZER_DISCARD
         */
        rasterizerDiscard?: boolean;
    }
}

export interface ITransformFeedbackVaryings
{
    /**
     * 回写变量列表。
    */
    varyings: string[];

    /**
     * 交叉或者分离。
    */
    bufferMode: "INTERLEAVED_ATTRIBS" | "SEPARATE_ATTRIBS";
}

