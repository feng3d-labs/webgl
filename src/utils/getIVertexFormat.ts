import { IVertexFormat } from "@feng3d/render-api";

export function getIVertexFormat(numComponents: 1 | 2 | 3 | 4, type: IGLVertexAttributeTypes = "FLOAT", normalized = false): IVertexFormat
{
    for (const key in formatMap)
    {
        const element = formatMap[key];
        if (
            element.numComponents === numComponents
            && element.type === type
            && !element.normalized === !normalized
        )
        {
            return key as IVertexFormat;
        }
    }

    console.error(`没有找到与 ${JSON.stringify({ numComponents, type, normalized })} 对应的顶点数据格式！`);

    return undefined;
}

export function getIGLVertexFormat(format: IVertexFormat): IGLVertexFormat
{
    const glVertexFormat = formatMap[format];

    console.assert(!!glVertexFormat, `接收到错误值，请从 ${Object.keys(formatMap).toString()} 中取值！`);

    return glVertexFormat;
}

export const formatMap: { [key: string]: IGLVertexFormat } = {

    uint8x2: { numComponents: 2, type: "UNSIGNED_BYTE", normalized: false },
    uint8x4: { numComponents: 4, type: "UNSIGNED_BYTE", normalized: false },
    sint8x2: { numComponents: 2, type: "BYTE", normalized: false },
    sint8x4: { numComponents: 4, type: "BYTE", normalized: false },
    unorm8x2: { numComponents: 2, type: "UNSIGNED_BYTE", normalized: true },
    unorm8x4: { numComponents: 4, type: "UNSIGNED_BYTE", normalized: true },
    snorm8x2: { numComponents: 2, type: "BYTE", normalized: true },
    snorm8x4: { numComponents: 4, type: "BYTE", normalized: true },
    uint16x2: { numComponents: 2, type: "UNSIGNED_SHORT", normalized: false },
    uint16x4: { numComponents: 4, type: "UNSIGNED_SHORT", normalized: false },
    sint16x2: { numComponents: 2, type: "SHORT", normalized: false },
    sint16x4: { numComponents: 4, type: "SHORT", normalized: false },
    unorm16x2: { numComponents: 2, type: "UNSIGNED_SHORT", normalized: true },
    unorm16x4: { numComponents: 4, type: "UNSIGNED_SHORT", normalized: true },
    snorm16x2: { numComponents: 2, type: "SHORT", normalized: true },
    snorm16x4: { numComponents: 4, type: "SHORT", normalized: true },
    float16x2: { numComponents: 2, type: "HALF_FLOAT", normalized: false },
    float16x4: { numComponents: 4, type: "HALF_FLOAT", normalized: false },
    float32: { numComponents: 1, type: "FLOAT", normalized: false },
    float32x2: { numComponents: 2, type: "FLOAT", normalized: false },
    float32x3: { numComponents: 3, type: "FLOAT", normalized: false },
    float32x4: { numComponents: 4, type: "FLOAT", normalized: false },
    uint32: { numComponents: 1, type: "UNSIGNED_INT", normalized: false },
    uint32x2: { numComponents: 2, type: "UNSIGNED_INT", normalized: false },
    uint32x3: { numComponents: 3, type: "UNSIGNED_INT", normalized: false },
    uint32x4: { numComponents: 4, type: "UNSIGNED_INT", normalized: false },
    sint32: { numComponents: 1, type: "INT", normalized: false },
    sint32x2: { numComponents: 2, type: "INT", normalized: false },
    sint32x3: { numComponents: 3, type: "INT", normalized: false },
    sint32x4: { numComponents: 4, type: "INT", normalized: false },
    "unorm10-10-10-2": { numComponents: 4, type: "UNSIGNED_INT_2_10_10_10_REV", normalized: true },
};

interface IGLVertexFormat
{
    /**
     * 顶点数据元素数量。
     */
    numComponents: 1 | 2 | 3 | 4;

    /**
     * 属性缓冲数据类型
     *
     * 默认从Buffer数据中获取，如果未取到则默认为 "FLOAT" 。
     */
    type: IGLVertexAttributeTypes;

    /**
     * 是否标准化。
     */
    normalized: boolean;
}

/**
 * 属性缓冲数据类型
 *
 * A GLenum specifying the data type of each component in the array. Possible values:
 *
 * * gl.BYTE: signed 8-bit integer, with values in [-128, 127]
 * * gl.SHORT: signed 16-bit integer, with values in [-32768, 32767]
 * * gl.UNSIGNED_BYTE: unsigned 8-bit integer, with values in [0, 255]
 * * gl.UNSIGNED_SHORT: unsigned 16-bit integer, with values in [0,65535]
 * * gl.FLOAT: 32-bit IEEE floating point number
 *
 * When using a WebGL 2 context, the following values are available additionally:
 *
 * * gl.HALF_FLOAT: 16-bit IEEE floating point number
 * * gl.INT: 32-bit signed binary integer
 * * gl.UNSIGNED_INT: 32-bit unsigned binary integer
 * * gl.INT_2_10_10_10_REV: 32-bit signed integer with values in [-512, 511]
 * * gl.UNSIGNED_INT_2_10_10_10_REV: 32-bit unsigned integer with values in [0, 1023]
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 */
export type IGLVertexAttributeTypes = "FLOAT" | "BYTE" | "SHORT" | "UNSIGNED_BYTE" | "UNSIGNED_SHORT" // WebGL1
    | "HALF_FLOAT" | "INT" | "UNSIGNED_INT" | "INT_2_10_10_10_REV" | "UNSIGNED_INT_2_10_10_10_REV"; // WebGL2

/**
 * A GLenum specifying the data type of each component in the array. Must be one of:
 * * gl.BYTE
 * * gl.UNSIGNED_BYTE
 * * gl.SHORT
 * * gl.UNSIGNED_SHORT
 * * gl.INT
 * * gl.UNSIGNED_INT.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/vertexAttribIPointer
 */
export type IGLVertexAttributeIntegerTypes = "BYTE" | "UNSIGNED_BYTE" | "SHORT" | "UNSIGNED_SHORT" | "INT" | "UNSIGNED_INT";