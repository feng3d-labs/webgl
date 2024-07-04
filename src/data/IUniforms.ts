import { IBuffer } from "./IBuffer";
import { ISamplerTexture } from "./ISamplerTexture";

/**
 * Uniform 类型
 */
export type IUniformType = ISamplerTexture | ISamplerTexture[] | number | number[] | Float32Array | (number[] | Float32Array)[] | IUniformBuffer | IUniforms;

export interface IUniformBuffer extends IBuffer
{
    target: "UNIFORM_BUFFER";
}

/**
 * Uniform 数据
 */
export interface IUniforms
{
    [key: string]: IUniformType;
}
