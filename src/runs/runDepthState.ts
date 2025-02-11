import { ICompareFunction, IDepthStencilState } from "@feng3d/render-api";
import { IGLCompareFunction } from "../data/IGLDepthStencilState";

export function getIGLCompareFunction(depthCompare: ICompareFunction)
{
    const glDepthCompare: IGLCompareFunction = depthCompareMap[depthCompare];

    console.assert(!!glDepthCompare, `接收到错误值，请从 ${Object.keys(depthCompareMap).toString()} 中取值！`);

    return glDepthCompare;
}

const depthCompareMap: { [key: string]: IGLCompareFunction } = {
    never: "NEVER",
    less: "LESS",
    equal: "EQUAL",
    "less-equal": "LEQUAL",
    greater: "GREATER",
    "not-equal": "NOTEQUAL",
    "greater-equal": "GEQUAL",
    always: "ALWAYS",
};