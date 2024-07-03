import { IWebGLUniformType } from "../const/WebGLUniformType";

/**
 * WebGL统一变量
 */
export interface IUniformInfo
{
    /**
     * 名称。
     */
    name: string;

    type: IWebGLUniformType;

    /**
     * 是否纹理。
     */
    isTexture: boolean;

    /**
     * 子项信息列表。
     */
    items: IUniformItemInfo[]
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