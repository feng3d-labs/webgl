import {  } from "@feng3d/render-api";
import { GLOcclusionQueryStep } from "../../caches/getGLRenderOcclusionQuery";

declare module "@feng3d/render-api"
{
    export interface OcclusionQuery
    {
        /**
         * 临时变量, 执行过程中由引擎自动填充。
         *
         * @internal
         */
        _step?: GLOcclusionQueryStep;
    }

}
