import { UniformDataItem } from "@feng3d/render-api";
import { GLSamplerTexture } from "../GLSamplerTexture";

declare module "@feng3d/render-api"
{
    export interface UniformTypeMap
    {
        GLSamplerTexture: GLSamplerTexture;
        UniformDataItem: UniformDataItem;
    }
}
