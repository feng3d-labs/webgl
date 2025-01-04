import { Lazy } from "../types";
import { IGLUniformBuffer } from "./IGLBuffer";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

/**
 * Uniform 类型
 */
export type IGLUniformType = IGLSamplerTexture | IGLUniformDataItem | IGLUniformBuffer;

/**
 * Uniform 数据
 */
export interface IGLUniforms
{
    [key: string]: Lazy<IGLUniformType>;
}

export type IGLUniformDataItem = number | number[] | Float32Array | Int32Array;
