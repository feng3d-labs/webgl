import { IGLRenderPass } from "../data/IGLRenderPass";
import { runPassDescriptor } from "./runPassDescriptor";
import { runQueryAction } from "./runQueryAction";
import { runRenderObject } from "./runRenderObject";
import { runScissor } from "./runScissor";
import { runViewPort } from "./runViewPort";

export function runRenderPass(gl: WebGLRenderingContext, renderPass: IGLRenderPass)
{
    runPassDescriptor(gl, renderPass.descriptor);

    renderPass.renderObjects?.forEach((renderObject) =>
    {
        if (renderObject.__type === "IGLQueryAction")
        {
            runQueryAction(gl, renderObject);
        }
        else if (renderObject.__type === "IGLViewport")
        {
            runViewPort(gl, renderObject)
        }
        else if (renderObject.__type === "IGLScissor")
        {
            runScissor(gl, renderObject);
        }
        else
        {
            runRenderObject(gl, renderObject);
        }
    });
}
