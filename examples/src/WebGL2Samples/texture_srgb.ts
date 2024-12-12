import { IRenderPass, IRenderPassObject, IRenderPipeline, ITexture } from "@feng3d/render-api";
import { getIGLBuffer, IGLCanvasContext, IGLSampler, IGLVertexAttributes, IGLVertexDataTypes, WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const webgl = new WebGL(rc);

    // -- Initialize program

    const program: IRenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Initialize buffer

    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IGLVertexDataTypes = positions;

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IGLVertexDataTypes = texcoords;

    // -- Initialize vertex array

    const vertices: IGLVertexAttributes = {
        position: { data: vertexPosBuffer, numComponents: 2 },
        textureCoordinates: { data: vertexTexBuffer, numComponents: 2 },
    }

    // -- Load texture then render

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: ITexture;
    let sampler: IGLSampler;
    loadImage(imageUrl, function (image)
    {
        texture = {
            size: [image.width, image.height],
            format: "rgba8unorm-srgb",
            sources: [{ mipLevel: 0, image: image }],
        };
        sampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

        render();
    });

    function render()
    {
        const renderObjects: IRenderPassObject[] = [];
        // Clear color buffer
        const rp: IRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: renderObjects,
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        renderObjects.push({
            pipeline: program,
            vertices,
            uniforms: {
                mvp: matrix,
                material: { diffuse: { texture, sampler } },
            },
            drawVertex: { vertexCount: 6 },
        });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Cleanup
        webgl.deleteBuffer(getIGLBuffer(vertexPosBuffer));
        webgl.deleteBuffer(getIGLBuffer(vertexTexBuffer));
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    }
})();
