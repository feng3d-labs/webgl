import { LazyObject } from "@feng3d/polyfill";
import { AttributeBuffer } from "../data/AttributeBuffer";
import { DrawCall } from "../data/DrawCall";
import { ElementBuffer } from "../data/ElementBuffer";
import { RenderAtomic } from "../data/RenderAtomic";
import { RenderParams } from "../data/RenderParams";
import { Shader } from "../data/Shader";
import { Uniforms } from "../data/Uniforms";
import { ShaderMacro } from "../shader/Macro";
import { WebGLAttributeBuffers } from "./WebGLAttributeBuffers";

export class WebGLRenderAtomic
{
    /**
     * 顶点索引缓冲
     */
    index: ElementBuffer;

    /**
     * 属性数据列表
     */
    attributes: { [key: string]: AttributeBuffer; };

    /**
     * Uniform渲染数据
     */
    uniforms: LazyObject<Uniforms>;

    drawCall = new DrawCall();

    /**
     * 渲染程序
     */
    shader: Shader;

    /**
     * shader 中的 宏
     */
    shaderMacro: ShaderMacro;

    /**
     * 渲染参数
     */
    renderParams: RenderParams;

    constructor(renderAtomic: RenderAtomic)
    {
        this.index = renderAtomic.index;
        this.attributes = renderAtomic.attributes;
        this.uniforms = renderAtomic.uniforms;
        this.drawCall = renderAtomic.drawCall;
        this.shader = renderAtomic.shader;
        this.shaderMacro = renderAtomic.shaderMacro;
        this.renderParams = renderAtomic.renderParams;
    }

    /**
     * 获取属性顶点属性。
     *
     * @param attributes
     * @returns
     */
    getAttributeVertexNum(attributes: WebGLAttributeBuffers)
    {
        const vertexNum = ((attributelist) =>
        {
            for (const attr in attributelist)
            {
                // eslint-disable-next-line no-prototype-builtins
                if (attributelist.hasOwnProperty(attr))
                {
                    const attribute = attributes.get(attributelist[attr]);

                    return attribute.count;
                }
            }

            return 0;
        })(this.attributes);

        return vertexNum;
    }
}
