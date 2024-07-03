import { ISamplerTexture } from "./ISamplerTexture";

/**
 * Uniform 类型
 */
export type IUniformType = ISamplerTexture | ISamplerTexture[] | number | number[] | Float32Array | (number[] | Float32Array)[];

/**
 * Uniform 数据
 */
export interface IUniforms
{
    [key: string]: IUniformType | IUniforms;
}
