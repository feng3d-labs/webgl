import { Texture } from "./Texture";

/**
 * Uniform 类型
 */
export type UniformType = Texture | number | number[] | Float32Array;

/**
 * Uniform 数据
 */
export interface Uniforms
{
    [key: string]: UniformType;
}
