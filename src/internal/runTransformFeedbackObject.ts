import { TransformFeedbackObject } from "../data/TransformFeedbackPass";
import { getGLDrawMode, GLDrawMode } from "../caches/getGLDrawMode";
import { runTransformFeedbackPipeline } from "./runTransformFeedbackPipeline";
import { runVertexArray } from "./renderObject/runVertexArray";
import { runUniforms } from "./renderObject/runUniforms";
import { runTransformFeedback } from "./runTransformFeedback";
import { runDrawVertex } from "./renderObject/runDrawVertex";
import { endTransformFeedback } from "./endTransformFeedback";

export function runTransformFeedbackObject(gl: WebGLRenderingContext, renderObject: TransformFeedbackObject)
{
    const { pipeline: material, vertices, uniforms, transformFeedback, draw } = renderObject;

    const drawMode = getGLDrawMode("point-list");

    runTransformFeedbackPipeline(gl, material);

    runVertexArray(gl, material, vertices, undefined);

    runUniforms(gl, material, uniforms);

    runTransformFeedback(gl, transformFeedback, drawMode);

    runDrawVertex(gl, drawMode, draw);

    endTransformFeedback(gl, transformFeedback);
}

