import { BufferUsage } from "../gl/WebGLEnums";
import { AttributeBufferSourceTypes } from "./AttributeBuffer";

/**
 * WebGL缓冲区
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData#gl.element_array_buffer
 */
export interface IWebGLBuffer
{
    /**
     *
     */
    target: "ARRAY_BUFFER" | "ELEMENT_ARRAY_BUFFER" // WebGL1
    | "COPY_READ_BUFFER" | "COPY_WRITE_BUFFER" | "TRANSFORM_FEEDBACK_BUFFER" | "UNIFORM_BUFFER" | "PIXEL_PACK_BUFFER" | "PIXEL_UNPACK_BUFFER" // WebGL2
    ;

    size?: number;

    data?: AttributeBufferSourceTypes;

    usage: BufferUsage;
}
