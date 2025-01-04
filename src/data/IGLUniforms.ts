import { Lazy } from "@feng3d/render-api";
import { IGLUniformBuffer } from "./IGLBuffer";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

declare module "@feng3d/render-api"
{
    export interface IUniformTypeMap
    {
        IGLSamplerTexture: IGLSamplerTexture;
        IGLUniformDataItem: IGLUniformDataItem;
        IGLUniformBuffer: IGLUniformBuffer;
    }
}

export type IGLUniformDataItem = number | number[] | Float32Array | Int32Array;