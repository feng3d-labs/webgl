import { RenderPassObject } from "@feng3d/render-api";
import { runRenderObject } from "./runRenderObject";
import { runOcclusionQuery } from "./runOcclusionQuery";

export function runRenderObjects(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObjects?: readonly RenderPassObject[])
{
    renderObjects?.forEach((renderObject) =>
    {
        if (renderObject.__type__ === "OcclusionQuery")
        {
            runOcclusionQuery(gl, attachmentSize, renderObject);
        }
        else
        {
            runRenderObject(gl, attachmentSize, renderObject);
        }
    });
}

