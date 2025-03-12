import { CanvasContext, IRenderPassObject, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes, VertexDataTypes } from "@feng3d/render-api";
import { getIGLBuffer, WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2", webGLContextAttributes: { antialias: false }};
    const webgl = new WebGL(rc);

    // -- Initialize program

    const program: RenderPipeline = {
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
    const vertexPosBuffer: VertexDataTypes = positions;

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: VertexDataTypes = texcoords;

    // -- Initialize vertex array

    const vertices: VertexAttributes = {
        position: { data: vertexPosBuffer, format: "float32x2" },
        textureCoordinates: { data: vertexTexBuffer, format: "float32x2" },
    };

    // -- Load texture then render

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: Texture;
    let sampler: Sampler;
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
        const rp: RenderPass = {
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
                draw: { __type__: "DrawVertex", vertexCount: 6 },
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
