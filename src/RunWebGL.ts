import { IGLCommandEncoder } from "./data/IGLCommandEncoder";
import { IGLRenderPass } from "./data/IGLRenderPass";
import { IGLSubmit } from "./data/IGLSubmit";
import { runPassDescriptor } from "./runs/runPassDescriptor";
import { runQueryAction } from "./runs/runQueryAction";
import { runRenderObject } from "./runs/runRenderObject";
import { runScissor } from "./runs/runScissor";
import { runViewPort } from "./runs/runViewPort";

export class RunWebGL
{
    runSubmit(gl: WebGLRenderingContext, submit: IGLSubmit)
    {
        const commandBuffers = submit.commandEncoders.map((v) =>
        {
            const commandBuffer = this.runCommandEncoder(gl, v);

            return commandBuffer;
        });
    }

    protected runCommandEncoder(gl: WebGLRenderingContext, commandEncoder: IGLCommandEncoder)
    {
        commandEncoder.passEncoders.forEach((passEncoder) =>
        {
            if (!passEncoder.__type)
            {
                this.runRenderPass(gl, passEncoder as IGLRenderPass);
            }
            else if (passEncoder.__type === "IGLRenderPass")
            {
                this.runRenderPass(gl, passEncoder);
            }
            else
            {
                console.error(`未处理 passEncoder ${passEncoder}`);
            }
        });
    }

    protected runRenderPass(gl: WebGLRenderingContext, renderPass: IGLRenderPass)
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

}