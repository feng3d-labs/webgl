import { watcher } from "@feng3d/watcher";
import { DrawElementType, ElementBuffer, ElementBufferSourceTypes } from "../data/ElementBuffer";
import { VertexAttributeTypes } from "../data/IVertexAttribute";

declare global
{
    interface WebGLRenderingContext
    {
        _elementBufferMap: WeakMap<ElementBuffer, WebGLBuffer>
    }

    interface WebGLBuffer
    {
        /**
         * 元素数据类型
         */
        type: VertexAttributeTypes;

        /**
         * 元素数组长度
         */
        count: number;

        bytesPerElement: number;
    }
}

/**
 * 获取索引WebGL缓冲区。
 *
 * @param gl
 * @param element
 * @returns
 */
export function getElementWebGLBuffer(gl: WebGLRenderingContext, element: ElementBuffer)
{
    let buffer = gl._elementBufferMap.get(element);

    if (!buffer)
    {
        buffer = gl.createBuffer();
        gl._elementBufferMap.set(element, buffer);

        const updateBuffer = () =>
        {
            // 获取
            buffer.type = element.type || getDrawElementType(element.array);
            const array = getArrayBufferViewWithType(element.array, buffer.type);

            // 上传数据到WebGL
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl[element.usage || "STATIC_DRAW"]);

            //
            buffer.count = array.length;
        };

        updateBuffer();

        //
        watcher.watch(element, "array", updateBuffer);
    }

    return buffer;
}

function getDrawElementType(array: ElementBufferSourceTypes)
{
    let type: DrawElementType;
    if (array instanceof Uint8Array)
    {
        type = "UNSIGNED_BYTE";
    }
    else if (array instanceof Uint16Array)
    {
        type = "UNSIGNED_SHORT";
    }
    else if (array instanceof Uint32Array)
    {
        type = "UNSIGNED_INT";
    }
    else if (array.length < 1 << 8)
    {
        type = "UNSIGNED_BYTE";
    }
    else if (array.length < 1 << 16)
    {
        type = "UNSIGNED_SHORT";
    }
    else
    {
        type = "UNSIGNED_INT";
    }

    return type;
}

function getArrayBufferViewWithType(array: ElementBufferSourceTypes, type: DrawElementType)
{
    if (type === "UNSIGNED_BYTE")
    {
        if (!(array instanceof Uint8Array))
        {
            array = new Uint8Array(array);
        }
    }
    else if (type === "UNSIGNED_SHORT")
    {
        if (!(array instanceof Uint16Array))
        {
            array = new Uint16Array(array);
        }
    }
    else if (type === "UNSIGNED_INT")
    {
        if (!(array instanceof Uint32Array))
        {
            array = new Uint32Array(array);
        }
    }
    else
    {
        throw `未知元素缓冲数据类型 ${type}`;
    }

    return array;
}

