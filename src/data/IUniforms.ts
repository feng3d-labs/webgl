import { ISamplerTexture } from "./ISamplerTexture";

/**
 * Uniform 类型
 */
export type UniformType = ISamplerTexture | number | number[] | Float32Array;

/**
 * Uniform 数据
 */
export interface IUniforms
{
    [key: string]: UniformType;
}
