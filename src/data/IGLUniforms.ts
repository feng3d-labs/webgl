import { TypedArray } from "@feng3d/render-api";
import { IGLSamplerTexture } from "./IGLSamplerTexture";

declare module "@feng3d/render-api"
{
    export interface IUniformTypeMap
    {
        /**
         * Uniform Block 数据
         * 统一块数据
         */
        IBufferBinding: IBufferBinding;
        IGLSamplerTexture: IGLSamplerTexture;
        IGLUniformDataItem: IGLUniformDataItem;
    }
}

export type IGLUniformDataItem = number | number[] | number[][] | TypedArray | TypedArray[];

/**
 * 缓冲区绑定。
 */
export interface IBufferBinding
{
    [name: string]: IBufferBindingItem;

    /**
     * 如果未设置引擎将自动生成。
     */
    readonly bufferView?: TypedArray;
}

export type IBufferBindingItem = IGLUniformDataItem | { [key: string]: IBufferBindingItem };