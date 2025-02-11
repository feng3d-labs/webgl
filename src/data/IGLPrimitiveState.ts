import { ICullFace, IFrontFace, IPrimitiveTopology } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    export interface IPrimitiveTopologyMap
    {
        /**
         * 绘制循环连线。
         */
        "LINE_LOOP": "LINE_LOOP",

        /**
         * 绘制三角扇形。
         */
        "TRIANGLE_FAN": "TRIANGLE_FAN",
    }

    export interface ICullFaceMap
    {
        "FRONT_AND_BACK": "FRONT_AND_BACK";
    }

    export interface IPrimitiveState
    {
        /**
         * 图形拓扑结构。
         *
         * 以下仅在WebGL生效
         * * LINE_LOOP 绘制循环连线。
         * * TRIANGLE_FAN  绘制三角扇形。
         */
        readonly topology?: IPrimitiveTopology;

        /**
         * * `FRONT_AND_BACK` 剔除正面与背面，仅在WebGL中生效！
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
         */
        readonly cullFace?: ICullFace;

        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
         */
        readonly frontFace?: IFrontFace;
    }
}
