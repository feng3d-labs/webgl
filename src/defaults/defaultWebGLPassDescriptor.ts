import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";

export const defaultWebGLPassDescriptor: IWebGLPassDescriptor = {
    clearColor: [0, 0, 0, 0],
    clearMask: ["COLOR_BUFFER_BIT", "DEPTH_BUFFER_BIT", "STENCIL_BUFFER_BIT"],
    clearDepth: 1,
    depthTest: true,
    depthFunc: "LESS",
};
