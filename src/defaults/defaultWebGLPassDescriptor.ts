import { IWebGLPassDescriptor } from "../data/IWebGLPassDescriptor";

export const defaultWebGLPassDescriptor: IWebGLPassDescriptor = {
    clearMask: ["DEPTH_BUFFER_BIT", "STENCIL_BUFFER_BIT"],
    depthTest: true,
    depthFunc: "LESS",
};
