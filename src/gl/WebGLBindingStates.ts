import { GL } from './GL';

export class WebGLBindingStates
{
    private gl: GL;
    constructor(gl: GL)
    {
        this.gl = gl;
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
    enableAttribute(location: number, divisor = 0)
    {
        const { gl } = this;

        gl.enableVertexAttribArray(location);
        gl.vertexAttribDivisor(location, divisor);
    }
}
