import { ICullFace } from "@feng3d/render-api";

export function getIGLCullFace(cullFace: ICullFace)
{
    const glCullMode: IGLCullFace = cullFaceMap[cullFace];

    console.assert(!!glCullMode, `接收到错误值，请从 ${Object.keys(cullFaceMap).toString()} 中取值！`);

    return glCullMode;
}

const cullFaceMap: { [key: string]: IGLCullFace } = {
    "FRONT_AND_BACK": "FRONT_AND_BACK",
    "none": "BACK", // 不会开启剔除面功能，什么值无所谓。
    "front": "FRONT",
    "back": "BACK",
};

/**
 * 剔除面，默认 BACK，剔除背面。
 *
 * 默认情况下，逆时针的顶点连接顺序被定义为三角形的正面。
 * 使用gl.frontFace(gl.CW);调整顺时针为正面
 *
 * * FRONT 正面
 * * BACK 背面
 * * FRONT_AND_BACK 正面与背面
 *
 * @see http://www.jianshu.com/p/ee04165f2a02
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/cullFace
 */
export type IGLCullFace = "FRONT" | "BACK" | "FRONT_AND_BACK";