import { lazy } from '@feng3d/polyfill';
import { watcher } from '@feng3d/watcher';
import { ElementArrayBuffer } from '../data/ElementArrayBuffer';
import { RenderAtomic } from '../data/RenderAtomic';
import { WebGLRenderer } from '../WebGLRenderer';
import { AttributeUsage } from './WebGLEnums';

export class WebGLElementBufferRenderer
{
    private webGLRenderer: WebGLRenderer;
    private buffers = new WeakMap<ElementArrayBuffer, WebGLElementArrayBufferCacle>();

    constructor(webGLRenderer: WebGLRenderer)
    {
        this.webGLRenderer = webGLRenderer;
    }

    render(renderAtomic: RenderAtomic, offset: number, count: number)
    {
        const { gl, extensions, info, capabilities, attributes } = this.webGLRenderer;

        let instanceCount = ~~lazy.getValue(renderAtomic.getInstanceCount());
        const mode = gl[renderAtomic.getRenderParams().renderMode];

        const element = renderAtomic.getIndexBuffer();

        let type: number;
        let bytesPerElement: number;
        let vertexNum: number;

        if (element)
        {
            const elementCache = this.get(element);
            type = elementCache.type;
            bytesPerElement = elementCache.bytesPerElement;
            vertexNum = elementCache.count;
        }
        else
        {
            vertexNum = renderAtomic.getAttributeVertexNum(attributes);

            if (vertexNum === 0)
            {
                // console.warn(`顶点数量为0，不进行渲染！`);

                // return;
                vertexNum = 6;
            }
        }

        if (offset === undefined)
        {
            offset = 0;
        }

        if (count === undefined)
        {
            count = vertexNum - offset;
        }

        if (instanceCount > 1)
        {
            if (capabilities.isWebGL2)
            {
                if (element)
                {
                    (gl as WebGL2RenderingContext).drawElementsInstanced(mode, count, type, offset * bytesPerElement, instanceCount);
                }
                else
                {
                    (gl as WebGL2RenderingContext).drawArraysInstanced(mode, offset, count, instanceCount);
                }
            }
            else
            {
                const extension = extensions.get('ANGLE_instanced_arrays');

                if (extension === null)
                {
                    console.error('hardware does not support extension ANGLE_instanced_arrays.');

                    return;
                }
                if (element)
                {
                    extension.drawElementsInstancedANGLE(mode, count, type, offset * bytesPerElement, instanceCount);
                }
                else
                {
                    extension.drawArraysInstancedANGLE(mode, offset, count, instanceCount);
                }
            }
        }
        else
        {
            if (element)
            {
                gl.drawElements(mode, count, type, offset * bytesPerElement);
            }
            else
            {
                gl.drawArrays(mode, offset, count);
            }
            instanceCount = 1;
        }

        info.update(count, mode, instanceCount);
    }

    bindBuffer(element: ElementArrayBuffer)
    {
        const { gl } = this.webGLRenderer;

        if (element)
        {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.get(element).buffer);
        }
    }

    get(element: ElementArrayBuffer)
    {
        const { gl } = this.webGLRenderer;
        const buffers = this.buffers;

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

        const usage: AttributeUsage = element.usage || 'STATIC_DRAW';

        const array = element.array;

        const buffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array as any, gl[usage]);

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
