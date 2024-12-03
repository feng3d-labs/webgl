import { IGLRenderPass } from "../data/IGLRenderPass";
import { runPassDescriptor } from "./runPassDescriptor";
import { runQueryAction } from "./runQueryAction";
import { runRenderObject } from "./runRenderObject";

export function runRenderPass(gl: WebGLRenderingContext, renderPass: IGLRenderPass)
{
    runPassDescriptor(gl, renderPass.descriptor);

    renderPass.renderObjects?.forEach((renderObject) =>
    {
        if ("action" in renderObject)
        {
            runQueryAction(gl, renderObject);
        }
        else
        {
            runRenderObject(gl, renderObject);
        }
    });
}
