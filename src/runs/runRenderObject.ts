import { IGLRenderObject } from "../data/IGLRenderObject";
import { runDrawCall } from "./runDrawCall";
import { defaultPrimitiveState } from "./runPrimitiveState";
import { runRenderPipeline } from "./runRenderPipeline";
import { endTransformFeedback, runTransformFeedback } from "./runTransformFeedback";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IGLRenderObject)
{
    const { pipeline, vertices, indices, uniforms, transformFeedback } = renderObject;

    const topology = pipeline.primitive?.topology || defaultPrimitiveState.topology;

    runRenderPipeline(gl, pipeline);

    runTransformFeedback(gl, transformFeedback, topology);

    runVertexArray(gl, pipeline, vertices, indices);

    runUniforms(gl, pipeline, uniforms);

    runDrawCall(gl, renderObject);

    endTransformFeedback(gl, transformFeedback);
}
