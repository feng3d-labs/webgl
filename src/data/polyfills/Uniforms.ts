import { UniformDataItem } from "@feng3d/render-api";
import { SamplerTexture } from "../SamplerTexture";

declare module "@feng3d/render-api"
{
    export interface UniformTypeMap
    {
        GLSamplerTexture: SamplerTexture;
        UniformDataItem: UniformDataItem;
    }
}
