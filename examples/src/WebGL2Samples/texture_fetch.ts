import { IRenderPass, IRenderPipeline, ISampler, ITexture, IVertexAttributes } from "@feng3d/render-api";
import { IGLCanvasContext, WebGL } from "@feng3d/webgl";

import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IGLCanvasContext = { canvasId: "glcanvas", contextId: "webgl2" };
    const webgl = new WebGL(rc);

    // -- Init program
    const program: IRenderPipeline = { vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") } };

    // -- Init buffers: vec2 Position, vec2 Texcoord
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
    const vertexArray: { vertices?: IVertexAttributes } = {
        vertices: {
            position: { data: positions, format: "float32x2" },
            texcoord: { data: texCoords, format: "float32x2" },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // -- Init Texture
        const texture: ITexture = {
            size: [image.width, image.height],
            format: "rgba8unorm",
            sources: [{
                mipLevel: 0, image, flipY: false,
            }],
        };
        const sampler: ISampler = {
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

        const rp: IRenderPass = {
            descriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: [
                {
                    pipeline: program,
                    vertices: vertexArray.vertices,
                    uniforms: {
                        MVP: matrix,
                        diffuse: { texture, sampler },
                    },
                    drawVertex: { vertexCount: 6 },
                }
            ],
        };

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    });
})();
