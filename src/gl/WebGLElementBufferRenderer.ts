import { watcher } from '@feng3d/watcher';
import { ElementArrayBuffer } from '../data/ElementArrayBuffer';
import { WebGLCapabilities } from './WebGLCapabilities';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLInfo } from './WebGLInfo';

export class WebGLElementBufferRenderer
{
    mode: number;
    type: number;
    bytesPerElement: number;

    gl: WebGLRenderingContext;
    extensions: WebGLExtensions;
    info: WebGLInfo;
    capabilities: WebGLCapabilities;

    private buffers = new WeakMap<ElementArrayBuffer, WebGLElementArrayBufferCacle>();

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

    setIndex(value: WebGLElementArrayBufferCacle)
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

    renderInstances(start: number, count: number, primcount: number)
    {
        if (primcount === 0) return;

        const { gl, extensions, info, capabilities, mode, type, bytesPerElement } = this;

        if (capabilities.isWebGL2)
        {
            (gl as WebGL2RenderingContext).drawElementsInstanced(mode, count, type, start * bytesPerElement, primcount);
        }
        else
        {
            const extension = extensions.get('ANGLE_instanced_arrays');

            if (extension === null)
            {
                console.error('WebGLIndexedBufferRenderer: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');

                return;
            }
            extension.drawElementsInstancedANGLE(mode, count, type, start * bytesPerElement, primcount);
        }

        info.update(count, mode, primcount);
    }

    bindBuffer(element: ElementArrayBuffer)
    {
        const { gl } = this;

        if (element)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.get(element).buffer);
        }
    }

    get(element: ElementArrayBuffer)
    {
        const { gl, buffers } = this;

        let data = buffers.get(element);

        if (data === undefined)
        {
            data = new WebGLElementArrayBufferCacle(gl, element);
            buffers.set(element, data);
        }

        data.updateBuffer();

        return data;
    }

    remove(element: ElementArrayBuffer)
    {
        const { buffers } = this;

        const data = buffers.get(element);

        if (data)
        {
            data.dispose();

            buffers.delete(element);
        }
    }
}

class WebGLElementArrayBufferCacle
{
    gl: WebGLRenderingContext;
    //
    element: ElementArrayBuffer;
    buffer: WebGLBuffer;
    type: number;

    /**
     * 数据数量
     */
    count: number;

    /**
     * 是否标准化。
     */
    normalized: boolean;

    bytesPerElement: number;
    version: number;

    constructor(gl: WebGLRenderingContext, element: ElementArrayBuffer)
    {
        this.gl = gl;

        const array = element.array;
        const usage = gl[element.usage];

        const buffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array as any, usage);

        let type: number;

        if (array instanceof Float32Array)
        {
            type = gl.FLOAT;
        }
        else if (array instanceof Uint16Array)
        {
            type = gl.UNSIGNED_SHORT;
        }
        else if (array instanceof Int16Array)
        {
            type = gl.SHORT;
        }
        else if (array instanceof Uint32Array)
        {
            type = gl.UNSIGNED_INT;
        }
        else if (array instanceof Int32Array)
        {
            type = gl.INT;
        }
        else if (array instanceof Int8Array)
        {
            type = gl.BYTE;
        }
        else if (array instanceof Uint8Array)
        {
            type = gl.UNSIGNED_BYTE;
        }
        else if (array instanceof Uint8ClampedArray)
        {
            type = gl.UNSIGNED_BYTE;
        }
        else
        {
            throw new Error(`WebGLAttributes: Unsupported buffer data format: ${array}`);
        }

        this.element = element;
        this.buffer = buffer;
        this.type = type;
        this.count = array.length;
        this.bytesPerElement = array.BYTES_PER_ELEMENT;
        this.version = element.version;

        //
        watcher.watch(element, 'array', this.needsUpdate, this);
    }

    private needsUpdate()
    {
        this.element.version++;
    }

    updateBuffer()
    {
        const { gl, buffer, element } = this;

        if (this.version === element.version)
        {
            return;
        }
        this.version = element.version;

        const array = element.array;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, array);
    }

    dispose()
    {
        const { gl, buffer, element } = this;

        gl.deleteBuffer(buffer);

        watcher.watch(element, 'array', this.needsUpdate, this);

        this.gl = null;
        this.element = null;
        this.buffer = null;
    }
}
