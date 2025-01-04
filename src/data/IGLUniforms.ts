import { IGLUniformBuffer } from "./IGLBuffer";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

/**
 * Uniform 类型
 */
export type IGLUniformType = IGLSamplerTexture | number | number[] | Float32Array | Int32Array | IGLUniformBuffer;

/**
 * Uniform 数据
 */
export interface IGLUniforms
{
    [key: string]: IGLUniformType;
}
