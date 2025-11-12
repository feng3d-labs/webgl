import { CanvasContext, RenderObject, RenderPass, RenderPipeline, Sampler, Texture, VertexAttributes } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: "glcanvas", webGLcontextId: "webgl2", webGLContextAttributes: { antialias: false } };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init buffers
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);

    // -- Init VertexArray
    const vertexArray: { vertices?: VertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x2" },
            texcoord: { data: texCoords, format: "float32x2" },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // -- Init Texture
        const texture: Texture = {
            descriptor: {
                size: [image.width, image.height],
                format: "rgba8uint",
            },
            sources: [{
                mipLevel: 0, image, flipY: false,
            }],
        };
        const sampler: Sampler = {
            minFilter: "nearest",
            magFilter: "nearest",
        };

        // -- Render
        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        const ro: RenderObject = {
            pipeline: program,
            bindingResources: {
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            vertices: vertexArray.vertices,
            draw: { __type__: "DrawVertex", vertexCount: 6 },
        };

        const rp: RenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderPassObjects: [ro],
        };

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    });
})();
