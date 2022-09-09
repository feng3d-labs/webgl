import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLInfo } from './WebGLInfo';

export class WebGLBufferRenderer
{
    mode: number;

    gl: WebGLRenderingContext;
    extensions: WebGLExtensions;
    info: WebGLInfo;
    capabilities: WebGLCapabilities;

    constructor(gl: WebGLRenderingContext, extensions: WebGLExtensions, info: WebGLInfo, capabilities: WebGLCapabilities)
    {
        this.gl = gl;
        this.extensions = extensions;
        this.info = info;
        this.capabilities = capabilities;
    }

    setMode(value: number)
    {
        this.mode = value;
    }

    render(start: number, count: number)
    {
        const { gl, info, mode } = this;

        gl.drawArrays(mode, start, count);

        info.update(count, mode, 1);
    }

    renderInstances(start: number, count: number, primcount: number)
    {
        if (primcount === 0) return;

        const { gl, extensions, info, capabilities, mode } = this;

        if (capabilities.isWebGL2)
        {
            (gl as WebGL2RenderingContext).drawArraysInstanced(mode, start, count, primcount);
        }
        else
        {
            const extension = extensions.get('ANGLE_instanced_arrays');

            if (extension === null)
            {
                console.error('WebGLBufferRenderer: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');

                return;
            }
            extension.drawArraysInstancedANGLE(mode, start, count, primcount);
        }

        info.update(count, mode, primcount);
    }
}
