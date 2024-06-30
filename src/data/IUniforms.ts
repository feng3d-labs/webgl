import { ITexture } from "./ITexture";

/**
 * Uniform 类型
 */
export type UniformType = ITexture | number | number[] | Float32Array;

/**
 * Uniform 数据
 */
export interface IUniforms
{
    [key: string]: UniformType;
}
