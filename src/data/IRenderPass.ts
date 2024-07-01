import { IPassDescriptor } from "./IPassDescriptor";
import { IRenderObject } from "./IRenderObject";

/**
 * WebGL渲染通道
 *
 * 包含渲染通道描述以及需要渲染的对象列表。
 */
export class IRenderPass
{
    /**
     * WebGL渲染通道描述
     */
    passDescriptor?: IPassDescriptor;

    /**
     * 渲染对象列表，默认为 []。
     */
    renderObjects?: IRenderObject[];
}