import { IRenderPass, IRenderPassObject, IRenderPipeline, ISampler, ITexture, IVertexAttributes, IVertexDataTypes } from "@feng3d/render-api";
import { getIGLBuffer, IGLCanvasContext, WebGL } from "@feng3d/webgl";

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
    const vertexPosBuffer: IVertexDataTypes = positions;

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IVertexDataTypes = texcoords;

    // -- Initialize vertex array

    const vertices: IVertexAttributes = {
        position: { data: vertexPosBuffer, format: "float32x2" },
        textureCoordinates: { data: vertexTexBuffer, format: "float32x2" },
    };

    // -- Load texture then render

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: ITexture;
    let sampler: ISampler;
    loadImage(imageUrl, function (image)
    {
        texture = {
            size: [image.width, image.height],
            format: "rgba8unorm-srgb",
            sources: [{ mipLevel: 0, image }],
        };
        sampler = { minFilter: "nearest", magFilter: "nearest" };

        render();
    });

    function render()
    {
        const renderObjects: IRenderPassObject[] = [];
        // Clear color buffer
        const rp: IRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects,
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        renderObjects.push({
            pipeline: program,
            uniforms: {
                mvp: matrix,
                materialDiffuse: { texture, sampler },
            },
            geometry:{
                vertices,
                draw: { __type: "DrawVertex", vertexCount: 6 },
            }
        });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Cleanup
        webgl.deleteBuffer(getIGLBuffer(vertexPosBuffer));
        webgl.deleteBuffer(getIGLBuffer(vertexTexBuffer));
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    }
})();
