import { IBuffer, IRenderObject, IRenderPipeline, WebGL } from "../../../src";
import { IRenderingContext } from "../../../src/data/ICanvasContext";
import { getShaderSource } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const vertexPosBuffer: IBuffer = {
        data: [-0.3, -0.5,
            0.3, -0.5,
            0.0, 0.5]
    };
    const vertexColorBuffer: IBuffer = {
        data: [
            1.0, 0.5, 0.0,
            0.0, 0.5, 1.0]
    };

    const program: IRenderPipeline = {
        primitive: { topology: "TRIANGLES", cullMode: "NONE" },
        vertex: { code: getShaderSource("vs") },
        fragment: { code: getShaderSource("fs"), targets: [{ blend: {} }] }
    };

    const renderAtomic: IRenderObject = {
        vertices: {
            pos: { buffer: vertexPosBuffer, numComponents: 2 },
            color: { buffer: vertexColorBuffer, numComponents: 3, divisor: 1 },
        },
        uniforms: {},
        drawVertex: { instanceCount: 2 },
        pipeline: program
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const renderingContext: IRenderingContext = { canvasId: "glcanvas" };

    WebGL.runRenderPass(renderingContext, {
        passDescriptor: {
            colorAttachments: [{
                clearValue: [0.0, 0.0, 0.0, 1.0],
                loadOp: "clear",
            }],
        },
        renderObjects: [renderAtomic]
    });

    // -- Delete WebGL resources
    WebGL.deleteBuffer(renderingContext, vertexPosBuffer);
    WebGL.deleteBuffer(renderingContext, vertexColorBuffer);
    WebGL.deleteProgram(renderingContext, program);
    WebGL.deleteVertexArray(renderingContext, renderAtomic);
})();
