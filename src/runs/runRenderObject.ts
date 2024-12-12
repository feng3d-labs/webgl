import { IRenderObject } from "@feng3d/render-api";
import { getIGLDrawMode } from "../caches/getIGLDrawMode";
import { runDrawCall } from "./runDrawCall";
import { runRenderPipeline } from "./runRenderPipeline";
import { endTransformFeedback, runTransformFeedback } from "./runTransformFeedback";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IRenderObject)
{
    const { pipeline, vertices, indices, uniforms, transformFeedback } = renderObject;

    const topology = pipeline.primitive?.topology || "triangle-list";
    const drawMode = getIGLDrawMode(topology);

    runRenderPipeline(gl, pipeline);

    runTransformFeedback(gl, transformFeedback, drawMode);

    runVertexArray(gl, pipeline, vertices, indices);

    runUniforms(gl, pipeline, uniforms);

    runDrawCall(gl, renderObject, drawMode);

    endTransformFeedback(gl, transformFeedback);
}
