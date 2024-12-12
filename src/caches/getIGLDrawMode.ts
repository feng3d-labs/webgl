import { IPrimitiveTopology } from "@feng3d/render-api";
import { IGLDrawMode } from "../data/IGLPrimitiveState";

export function getIGLDrawMode(topology: IPrimitiveTopology): IGLDrawMode
{
    let drawMode = drawModeMap[topology];

    console.assert(!!drawMode, `WebGL 不支持参数 IPrimitiveTopology ${topology} !`);

    drawMode = drawMode || topology as any;

    return drawMode;
}

const drawModeMap: { [key: string]: IGLDrawMode } = {
    "point-list": "POINTS",
    "line-list": "LINES",
    "line-strip": "LINE_STRIP",
    "triangle-list": "TRIANGLES",
    "triangle-strip": "TRIANGLE_STRIP",
    "LINE_LOOP": "LINE_LOOP",
    "TRIANGLE_FAN": "TRIANGLE_FAN",
};