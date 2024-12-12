import { ICullFace, IFrontFace, IPrimitiveState } from "@feng3d/render-api";
import { IGLCullFace, IGLFrontFace } from "../data/IGLCullFace";

export function runPrimitiveState(gl: WebGLRenderingContext, primitive?: IPrimitiveState)
{
    const cullFace: ICullFace = primitive?.cullFace || "none";
    const frontFace: IFrontFace = primitive?.frontFace || "ccw";

    const enableCullFace = cullFace !== "none";
    const glCullMode: IGLCullFace = getIGLCullFace(cullFace);
    const glFrontFace: IGLFrontFace = getIGLFrontFace(frontFace);

    if (enableCullFace)
    {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl[glCullMode]);
        gl.frontFace(gl[glFrontFace]);
    }
    else
    {
        gl.disable(gl.CULL_FACE);
    }
}

function getIGLCullFace(cullFace: ICullFace)
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

function getIGLFrontFace(frontFace: IFrontFace)
{
    const glFrontFace: IGLFrontFace = frontFaceMap[frontFace];

    console.assert(!!glFrontFace, `接收到错误 IFrontFace 值，请从 ${Object.keys(cullFaceMap).toString()} 中取值！`);

    return glFrontFace;
}
const frontFaceMap: { [key: string]: IGLFrontFace } = {
    "ccw": "CCW",
    "cw": "CW",
};