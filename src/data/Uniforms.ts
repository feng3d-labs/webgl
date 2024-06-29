/**
 * Uniform 类型映射
 *
 * 用于扩展 Uniform 支持的类型
 */
export interface UniformTypeMap
{
}

/**
 * Uniform 类型
 */
export type UniformType = UniformTypeMap[keyof UniformTypeMap] | number | number[] | Float32Array;

/**
 * Uniform 数据
 */
export interface Uniforms
{
    [key: string]: UniformType;
}
