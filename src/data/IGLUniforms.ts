import { } from "@feng3d/render-api";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

declare module "@feng3d/render-api"
{
    export interface IUniformTypeMap
    {
        IGLSamplerTexture: IGLSamplerTexture;
        IGLUniformDataItem: IGLUniformDataItem;
    }
}

export type IGLUniformDataItem = number | number[] | Float32Array | Int32Array;
