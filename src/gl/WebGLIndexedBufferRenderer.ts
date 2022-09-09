import { WebGLAttributeBufferCacle } from '../WebGLAttributes';
import { GL } from './GL';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLInfo } from './WebGLInfo';

export class WebGLIndexedBufferRenderer
{
    mode: number;
    type: number;
    bytesPerElement: number;

    gl: GL;
    extensions: WebGLExtensions;
    info: WebGLInfo;
    capabilities: WebGLCapabilities;

    constructor(gl: GL, extensions: WebGLExtensions, info: WebGLInfo, capabilities: WebGLCapabilities)
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

    setIndex(value: WebGLAttributeBufferCacle)
    {
        this.type = value.type;
        this.bytesPerElement = value.bytesPerElement;
    }

    render(start: number, count: number)
    {
        const { gl, info, mode, type, bytesPerElement } = this;

        gl.drawElements(mode, count, type, start * bytesPerElement);

        info.update(count, mode, 1);
    }

    renderInstances(start: number, count: number, primcount)
    {
        if (primcount === 0) return;

        const { gl, extensions, info, capabilities, mode, type, bytesPerElement } = this;

        if (capabilities.isWebGL2)
        {
            gl.drawElementsInstanced(mode, count, type, start * bytesPerElement, primcount);
        }
        else
        {
            const extension = extensions.get('ANGLE_instanced_arrays');

            if (extension === null)
            {
                console.error('THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');

                return;
            }
            extension.drawElementsInstancedANGLE(mode, count, type, start * bytesPerElement, primcount);
        }

        info.update(count, mode, primcount);
    }
}
