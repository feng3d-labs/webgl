import { IGLUniformType } from "../const/IGLUniformType";

/**
 * WebGL统一变量
 */
export interface IGLUniformInfo
{
    /**
     * 名称。
     */
    name: string;

    type: IGLUniformType;

    /**
     * 是否纹理。
     */
    isTexture: boolean;

    /**
     * 子项信息列表。
     */
    items: IUniformItemInfo[]

    /**
     * 是否在Block中。
     */
    inBlock?: boolean;
}

/**
 * WebGL统一变量
 */
export interface IUniformItemInfo
{
    /**
     * uniform地址
     */
    location: WebGLUniformLocation;

    /**
     * texture索引
     */
    textureID: number;

    /**
     * Uniform数组索引，当Uniform数据为数组数据时生效
     */
    paths: string[];
}