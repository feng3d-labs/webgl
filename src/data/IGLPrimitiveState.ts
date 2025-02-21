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

}
