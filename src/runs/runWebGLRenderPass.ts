import { IWebGLRenderPass } from "../data/IWebGLRenderPass";
import { runRenderObject } from "./runRenderObject";
import { runWebGLPassDescriptor } from "./runWebGLPassDescriptor";

export function runWebGLRenderPass(gl: WebGLRenderingContext, renderPass: IWebGLRenderPass)
{
    runWebGLPassDescriptor(gl, renderPass.passDescriptor);

    renderPass.renderObjects?.forEach((renderObject) =>
    {
        runRenderObject(gl, renderObject);
    });
}