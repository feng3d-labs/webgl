import { IWebGLDrawIndexed } from "../data/IWebGLDrawIndexed";

const defaultWebGLDrawIndexed: IWebGLDrawIndexed = {
    indexCount: 6,
    instanceCount: 1,
    firstIndex: 0,
};

export function getWebGLDrawIndexed(drawIndexed: IWebGLDrawIndexed)
{
    drawIndexed = Object.assign({}, defaultWebGLDrawIndexed, drawIndexed);

    return drawIndexed;
}