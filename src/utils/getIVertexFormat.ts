import { GLVertexAttributeTypes, VertexFormat, VertexAttributeFormatInfo, vertexFormatMap } from "@feng3d/render-api";

export function getIVertexFormat(numComponents: 1 | 2 | 3 | 4, type: GLVertexAttributeTypes = "FLOAT", normalized = false): VertexFormat
{
    for (const key in vertexFormatMap)
    {
        const element = vertexFormatMap[key];
        if (
            element.numComponents === numComponents
            && element.type === type
            && !element.normalized === !normalized
        )
        {
            return key as VertexFormat;
        }
    }

    console.error(`没有找到与 ${JSON.stringify({ numComponents, type, normalized })} 对应的顶点数据格式！`);

    return undefined;
}

export function getIGLVertexFormat(format: VertexFormat): VertexAttributeFormatInfo
{
    const glVertexFormat = vertexFormatMap[format];

    console.assert(!!glVertexFormat, `接收到错误值，请从 ${Object.keys(vertexFormatMap).toString()} 中取值！`);

    return glVertexFormat;
}

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