import { IUniformDataItem } from "@feng3d/render-api";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

declare module "@feng3d/render-api"
{
    export interface IUniformTypeMap
    {
        IGLSamplerTexture: IGLSamplerTexture;
        IUniformDataItem: IUniformDataItem;
    }
}
