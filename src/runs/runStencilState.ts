import { ICompareFunction, IStencilOperation } from "@feng3d/render-api";

export function getIGLStencilFunc(compare: ICompareFunction)
{
    const stencilFunc: GLStencilFunc = compareMap[compare];

    return stencilFunc;
}

const compareMap: { [key: string]: GLStencilFunc } = {
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
 * A GLenum specifying the test function. The default function is gl.ALWAYS.
 *
 * * `NEVER` 总是不通过。
 * * `LESS` 如果 (ref & mask) <  (stencil & mask) 则通过。
 * * `EQUAL` 如果 (ref & mask) = (stencil & mask) 则通过。
 * * `LEQUAL` 如果 (ref & mask) <= (stencil & mask) 则通过。
 * * `GREATER` 如果 (ref & mask) > (stencil & mask) 则通过。
 * * `NOTEQUAL` 如果 (ref & mask) != (stencil & mask) 则通过。
 * * `GEQUAL` 如果 (ref & mask) >= (stencil & mask) 则通过。
 * * `ALWAYS` 总是通过。
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilFunc
 */
export type GLStencilFunc = "NEVER" | "LESS" | "EQUAL" | "LEQUAL" | "GREATER" | "NOTEQUAL" | "GEQUAL" | "ALWAYS";


export function getIGLStencilOp(stencilOperation?: IStencilOperation)
{
    const glStencilOp: GLStencilOp = stencilOperationMap[stencilOperation];

    return glStencilOp;
}
const stencilOperationMap: { [key: string]: GLStencilOp } = {
    keep: "KEEP",
    zero: "ZERO",
    replace: "REPLACE",
    invert: "INVERT",
    "increment-clamp": "INCR",
    "decrement-clamp": "DECR",
    "increment-wrap": "INCR_WRAP",
    "decrement-wrap": "DECR_WRAP",
};

/**
 * The WebGLRenderingContext.stencilOp() method of the WebGL API sets both the front and back-facing stencil test actions.
 *
 * * `KEEP` 保持当前值。
 * * `ZERO` 设置模板缓冲值为0
 * * `REPLACE` 将模板缓冲区的值设置为WebGLRenderingContext.stencilFunc()指定的参考值。
 * * `INCR` 增加当前模板缓冲区的值。最大到可表示的无符号值的最大值。
 * * `INCR_WRAP` 增加当前模板缓冲区的值。当增加最大的可表示无符号值时，将模板缓冲区值包装为零。
 * * `DECR` 递减当前模板缓冲区的值。最小为0。
 * * `DECR_WRAP` 递减当前模板缓冲区的值。当模板缓冲区值减为0时，将模板缓冲区值包装为可表示的最大无符号值。
 * * `INVERT` 按位反转当前模板缓冲区值。
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/stencilOp
 */
export type GLStencilOp = "KEEP" | "ZERO" | "REPLACE" | "INCR" | "INCR_WRAP" | "DECR" | "DECR_WRAP" | "INVERT";
