import { IFrontFace } from "@feng3d/render-api";

export function getIGLFrontFace(frontFace: IFrontFace)
{
    const glFrontFace: IGLFrontFace = frontFaceMap[frontFace];

    console.assert(!!glFrontFace, `接收到错误 IFrontFace 值，请从 ${Object.keys(frontFaceMap).toString()} 中取值！`);

    return glFrontFace;
}
const frontFaceMap: { [key: string]: IGLFrontFace } = {
    ccw: "CCW",
    cw: "CW",
};

/**
 * 正面方向枚举
 *
 * * CW 顺时钟方向
 * * CCW 逆时钟方向
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/frontFace
 */
export type IGLFrontFace = "CW" | "CCW";
