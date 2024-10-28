import { IGLBuffer } from "./IGLBuffer";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

/**
 * Uniform 类型
 */
export type IGLUniformType = IGLSamplerTexture | IGLSamplerTexture[] | number | number[] | Float32Array | (number[] | Float32Array)[] | Int32Array | IGLUniformBuffer | IGLUniforms;

export interface IGLUniformBuffer extends IGLBuffer
{
    target: "UNIFORM_BUFFER";
}

/**
 * Uniform 数据
 */
export interface IGLUniforms
{
    [key: string]: IGLUniformType;
}
