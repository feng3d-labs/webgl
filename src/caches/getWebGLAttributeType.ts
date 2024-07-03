/**
 * WebGL 属性类型。
 */
export type IWebGLAttributeType = keyof typeof webglAttributeTypeValue;

/**
 * 获取顶点数据类型名称。
 *
 * @param gl
 * @param value
 */
export function getWebGLAttributeValueType(value: keyof typeof webglAttributeValueType)
{
    return webglAttributeValueType[value];
}

const webglAttributeTypeValue = Object.freeze({ FLOAT: 5126, BYTE: 5120, SHORT: 5122, UNSIGNED_BYTE: 5121, UNSIGNED_SHORT: 5123, HALF_FLOAT: 5131, INT: 5124, UNSIGNED_INT: 5125 });
const webglAttributeValueType = Object.freeze({ 5120: "BYTE", 5121: "UNSIGNED_BYTE", 5122: "SHORT", 5123: "UNSIGNED_SHORT", 5124: "INT", 5125: "UNSIGNED_INT", 5126: "FLOAT", 5131: "HALF_FLOAT" });
