import { IndicesDataTypes, PrimitiveState, RenderObject } from "@feng3d/render-api";
import { getGLDrawMode, GLDrawMode } from "../caches/getGLDrawMode";
import { runViewPort } from "./runViewPort";
import { runScissor } from "./runScissor";
import { runRenderPipeline } from "./runRenderPipeline";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";
import { runPrimitiveState } from "./runPrimitiveState";
import { runDrawVertex } from "./runDrawVertex";
import { runDrawIndexed } from "./runDrawIndexed";

export function runRenderObject(gl: WebGLRenderingContext, attachmentSize: { width: number, height: number }, renderObject: RenderObject)
{
    const { viewport, scissorRect, pipeline, vertices, indices, draw, bindingResources: uniforms } = renderObject;
    const primitive = pipeline?.primitive;

    runViewPort(gl, attachmentSize, viewport);

    runScissor(gl, attachmentSize, scissorRect);

    runRenderPipeline(gl, pipeline);

    runUniforms(gl, pipeline, uniforms);

    runVertexArray(gl, pipeline, vertices, indices);

    runPrimitiveState(gl, primitive);

    const topology = primitive?.topology || "triangle-list";
    const drawMode = getGLDrawMode(topology);

    if (draw.__type__ === "DrawVertex")
    {
        runDrawVertex(gl, drawMode, draw);
    }
    else
    {
        runDrawIndexed(gl, drawMode, indices, draw);
    }
}

