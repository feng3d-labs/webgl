import { ICompareFunction, IStencilOperation } from "@feng3d/render-api";
import { IGLStencilFunc, IGLStencilOp } from "../data/IGLDepthStencilState";

export function getIGLStencilFunc(compare: ICompareFunction)
{
    const stencilFunc: IGLStencilFunc = compareMap[compare];

    return stencilFunc;
}
const compareMap: { [key: string]: IGLStencilFunc } = {
    never: "NEVER",
    less: "LESS",
    equal: "EQUAL",
    "less-equal": "LEQUAL",
    greater: "GREATER",
    "not-equal": "NOTEQUAL",
    "greater-equal": "GEQUAL",
    always: "ALWAYS",
};

export function getIGLStencilOp(stencilOperation?: IStencilOperation)
{
    const glStencilOp: IGLStencilOp = stencilOperationMap[stencilOperation];

    return glStencilOp;
}
const stencilOperationMap: { [key: string]: IGLStencilOp } = {
    keep: "KEEP",
    zero: "ZERO",
    replace: "REPLACE",
    invert: "INVERT",
    "increment-clamp": "INCR",
    "decrement-clamp": "DECR",
    "increment-wrap": "INCR_WRAP",
    "decrement-wrap": "DECR_WRAP",
};