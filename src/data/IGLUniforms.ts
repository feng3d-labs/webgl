import { Lazy } from "@feng3d/render-api";
import { IGLUniformBuffer } from "./IGLBuffer";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

/**
 * Uniform 类型
 */
export type IGLUniformType = IGLUniformTypeMap[keyof IGLUniformTypeMap];

/**
 * Uniform 数据
 */
export interface IGLUniforms
{
    [key: string]: Lazy<IGLUniformType>;
}

export type IGLUniformDataItem = number | number[] | Float32Array | Int32Array;

export interface IGLUniformTypeMap
{
    IGLSamplerTexture: IGLSamplerTexture;
    IGLUniformDataItem: IGLUniformDataItem;
    IGLUniformBuffer: IGLUniformBuffer;
}