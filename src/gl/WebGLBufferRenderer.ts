import { RenderAtomic } from '../data/RenderAtomic';
import { WebGLRenderer } from '../WebGLRenderer';

export class WebGLBufferRenderer
{
    webGLRenderer: WebGLRenderer;

    constructor(webGLRenderer: WebGLRenderer)
    {
        this.webGLRenderer = webGLRenderer;
    }

    render(renderAtomic: RenderAtomic, mode: number, offset: number, count: number, instanceCount: number)
    {
        const { gl, extensions, info, capabilities, attributes } = this.webGLRenderer;

        let vertexNum = renderAtomic.getAttributeVertexNum(attributes);

        if (vertexNum === 0)
        {
            // console.warn(`顶点数量为0，不进行渲染！`);

            // return;
            vertexNum = 6;
        }

        if (count === undefined)
        {
            count = vertexNum - offset;
        }

        if (instanceCount > 1)
        {
            if (capabilities.isWebGL2)
            {
                (gl as WebGL2RenderingContext).drawArraysInstanced(mode, offset, count, instanceCount);
            }
            else
            {
                const extension = extensions.get('ANGLE_instanced_arrays');

                if (extension === null)
                {
                    console.error('WebGLBufferRenderer: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');

                    return;
                }
                extension.drawArraysInstancedANGLE(mode, offset, count, instanceCount);
            }
        }
        else
        {
            gl.drawArrays(mode, offset, count);
            instanceCount = 1;
        }

        info.update(count, mode, instanceCount);
    }
}
