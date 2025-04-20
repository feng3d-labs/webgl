import { ICompareFunction, DepthStencilState } from "@feng3d/render-api";

export function getIGLCompareFunction(depthCompare: ICompareFunction)
{
    const glDepthCompare: GLCompareFunction = depthCompareMap[depthCompare];

    console.assert(!!glDepthCompare, `接收到错误值，请从 ${Object.keys(depthCompareMap).toString()} 中取值！`);

    return glDepthCompare;
}

const depthCompareMap: { [key: string]: GLCompareFunction } = {
    never: "NEVER",
    less: "LESS",
    equal: "EQUAL",
    "less-equal": "LEQUAL",
    greater: "GREATER",
    "not-equal": "NOTEQUAL",
    "greater-equal": "GEQUAL",
    always: "ALWAYS",
};

/**
 * 指定深度比较函数的枚举，该函数设置绘制像素的条件，默认 LESS，如果传入值小于深度缓冲区值则通过。
 *
 * A GLenum specifying the depth comparison function, which sets the conditions under which the pixel will be drawn. The default value is gl.LESS.
 *
 * * `NEVER` 总是不通过。
 * * `LESS` 如果传入值小于深度缓冲区值则通过。
 * * `EQUAL` 如果传入值等于深度缓冲区值则通过。
 * * `LEQUAL` 如果传入值小于或等于深度缓冲区值则通过。
 * * `GREATER` 如果传入值大于深度缓冲区值则通过。
 * * `NOTEQUAL` 如果传入值不等于深度缓冲区值则通过。
 * * `GEQUAL` 如果传入值大于或等于深度缓冲区值则通过。
 * * `ALWAYS` 总是通过。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/depthFunc
 */
export type GLCompareFunction = "NEVER" | "LESS" | "EQUAL" | "LEQUAL" | "GREATER" | "NOTEQUAL" | "GEQUAL" | "ALWAYS";
