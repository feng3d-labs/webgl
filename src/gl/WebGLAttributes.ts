import { watcher } from '@feng3d/watcher';
import { BufferAttribute } from '../data/BufferAttribute';
import { WebGLCapabilities } from './WebGLCapabilities';

export class WebGLAttributeBufferCacle
{
    gl: WebGLRenderingContext;
    capabilities: WebGLCapabilities;
    //
    attribute: BufferAttribute;
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

    constructor(gl: WebGLRenderingContext, capabilities: WebGLCapabilities, attribute: BufferAttribute, bufferType: number)
    {
        this.gl = gl;
        this.capabilities = capabilities;

        const array = attribute.array;
        const usage = gl[attribute.usage];

        const buffer = gl.createBuffer();

        gl.bindBuffer(bufferType, buffer);
        gl.bufferData(bufferType, array as any, usage);

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

        const count = array !== undefined ? array.length / attribute.itemSize : 0;

        const normalized = attribute.normalized === true;

        this.attribute = attribute;
        this.buffer = buffer;
        this.type = type;
        this.count = count;
        this.normalized = normalized;
        this.bytesPerElement = array.BYTES_PER_ELEMENT;
        this.version = attribute.version;

        //
        watcher.watch(attribute, 'array', this.needsUpdate, this);
    }

    private needsUpdate()
    {
        this.attribute.version++;
    }

    updateBuffer(bufferType: number)
    {
        const { gl, buffer, attribute } = this;

        const array = attribute.array;

        gl.bindBuffer(bufferType, buffer);

        gl.bufferSubData(bufferType, 0, array);
    }

    dispose()
    {
        const { gl, buffer, attribute } = this;

        gl.deleteBuffer(buffer);

        watcher.watch(attribute, 'array', this.needsUpdate, this);

        this.gl = null;
        this.capabilities = null;
        this.attribute = null;
        this.buffer = null;
    }
}

export class WebGLAttributes
{
    private gl: WebGLRenderingContext;
    private buffers = new WeakMap<BufferAttribute, WebGLAttributeBufferCacle>();
    private capabilities: WebGLCapabilities;

    constructor(gl: WebGLRenderingContext, capabilities: WebGLCapabilities)
    {
        this.gl = gl;
        this.capabilities = capabilities;
    }

    get(attribute: BufferAttribute)
    {
        const { buffers } = this;

        return buffers.get(attribute);
    }

    remove(attribute: BufferAttribute)
    {
        const { buffers } = this;

        const data = buffers.get(attribute);

        if (data)
        {
            data.dispose();

            buffers.delete(attribute);
        }
    }

    update(attribute: BufferAttribute, bufferType: number)
    {
        const { gl, capabilities, buffers } = this;

        let data = buffers.get(attribute);

        if (data === undefined)
        {
            data = new WebGLAttributeBufferCacle(gl, capabilities, attribute, bufferType);
            buffers.set(attribute, data);
        }
        else if (data.version < attribute.version)
        {
            data.updateBuffer(bufferType);

            data.version = attribute.version;
        }
    }

    vertexAttribPointer(location: number, attribute: BufferAttribute)
    {
        const { gl, capabilities } = this;

        const attributeBufferCacle = this.get(attribute);

        const size = attribute.itemSize;
        const buffer = attributeBufferCacle.buffer;
        const type = attributeBufferCacle.type;
        const bytesPerElement = attributeBufferCacle.bytesPerElement;
        const normalized = attributeBufferCacle.normalized;

        const stride = size * bytesPerElement;
        const offset = 0;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        if (capabilities.isWebGL2 === true && (type === gl.INT || type === gl.UNSIGNED_INT))
        {
            (gl as WebGL2RenderingContext).vertexAttribIPointer(location, size, type, stride, offset);
        }
        else
        {
            gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
        }
    }
}
