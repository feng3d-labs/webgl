import { IGLRenderObject } from "../data/IGLRenderObject";
import { runDrawCall } from "./runDrawCall";
import { defaultPrimitiveState } from "./runPrimitiveState";
import { runRenderPipeline } from "./runRenderPipeline";
import { endTransformFeedback, runTransformFeedback } from "./runTransformFeedback";
import { runUniforms } from "./runUniforms";
import { runVertexArray } from "./runVertexArray";

export function runRenderObject(gl: WebGLRenderingContext, renderObject: IGLRenderObject)
{
    const { pipeline, vertexArray, uniforms, transformFeedback } = renderObject;

    const topology = pipeline.primitive?.topology || defaultPrimitiveState.topology;

    runRenderPipeline(gl, pipeline);

    runVertexArray(gl, pipeline, vertexArray);

    runUniforms(gl, pipeline, uniforms);

    runTransformFeedback(gl, transformFeedback, topology);

    runDrawCall(gl, renderObject);

    endTransformFeedback(gl, transformFeedback);
}
