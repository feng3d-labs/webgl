import { IRenderPass } from "../data/IRenderPass";
import { runRenderObject } from "./runRenderObject";
import { runPassDescriptor } from "./runPassDescriptor";

export function runRenderPass(gl: WebGLRenderingContext, renderPass: IRenderPass)
{
    runPassDescriptor(gl, renderPass.passDescriptor);

    renderPass.renderObjects?.forEach((renderObject) =>
    {
        runRenderObject(gl, renderObject);
    });
}