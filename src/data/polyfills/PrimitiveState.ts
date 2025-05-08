import { CullFace, FrontFace, PrimitiveTopology } from "@feng3d/render-api";

declare module "@feng3d/render-api"
{
    export interface PrimitiveTopologyMap
    {
        /**
         * 绘制循环连线。
         *
         * 仅在WebGL生效。
         */
        "LINE_LOOP": "LINE_LOOP",

        /**
         * 绘制三角扇形。
         *
         * 仅在WebGL生效。
         */
        "TRIANGLE_FAN": "TRIANGLE_FAN",
    }

    export interface CullFaceMap
    {
        "FRONT_AND_BACK": "FRONT_AND_BACK";
    }

}
