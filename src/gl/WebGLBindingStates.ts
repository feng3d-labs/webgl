import { getCompileShaderResult } from "../caches/getCompileShaderResult";
import { getElementWebGLBuffer } from "../caches/getWebGLElementBuffer";
import { IIndexBuffer } from "../data/IIndexBuffer";
import { IRenderObject } from "../data/IRenderObject";
import { IVertexAttribute } from "../data/IVertexAttribute";
import { runVertexAttribute } from "../runs/runVertexAttribute";

declare global
{
    interface WebGLRenderingContextExt
    {
        _bindingStates: WebGLBindingStates;
    }
}

export class WebGLBindingStates
{
    private gl: WebGLRenderingContext;
    constructor(gl: WebGLRenderingContext)
    {
        this.gl = gl;
        gl._bindingStates = this;
    }

    setup(renderAtomic: IRenderObject)
    {
        const gl = this.gl;

        this.setupVertexAttributes(renderAtomic);

        //
        if (renderAtomic.index)
        {
            const buffer = getElementWebGLBuffer(gl, renderAtomic.index);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        }
    }

    /**
     * 设置顶点属性。
     *
     * @param renderAtomic 渲染原子。
     */
    private setupVertexAttributes(renderAtomic: IRenderObject)
    {
        const { gl } = this;

        const shaderResult = getCompileShaderResult(gl, renderAtomic.pipeline.vertex.code, renderAtomic.pipeline.fragment.code);

        for (const name in shaderResult.attributes)
        {
            const activeInfo = shaderResult.attributes[name];
            const location = activeInfo.location;
            // 处理 WebGL 内置属性 gl_VertexID 等
            if (location < 0)
            {
                continue;
            }

            const attribute = renderAtomic.vertices[name];

            this.enableAttribute(location, attribute.divisor);

            runVertexAttribute(gl, location, attribute);
        }
    }

    /**
     * 启用属性。
     *
     * @param location 指向要激活的顶点属性。
     * @param divisor drawElementsInstanced时将会用到的因子，表示divisor个geometry共用一个数据。
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor
     */
    enableAttribute(location: number, divisor?: number)
    {
        const { gl } = this;
        divisor = ~~divisor;

        gl.enableVertexAttribArray(location);

        if (gl instanceof WebGL2RenderingContext)
        {
            gl.vertexAttribDivisor(location, divisor);
        }
        else
        {
            const extension = gl.getExtension("ANGLE_instanced_arrays");
            extension.vertexAttribDivisorANGLE(location, divisor);
        }
    }
}
