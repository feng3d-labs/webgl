import { IProgram, IRenderPass, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer, WebGL } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };

    // -- Initialize program

    const program: IProgram = {
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
    const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texcoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texcoords, usage: "STATIC_DRAW" };

    // -- Initialize vertex array

    const vertexArray: IVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            textureCoordinates: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    // -- Load texture then render

    const imageUrl = "../../assets/img/Di-3d.png";
    let texture: ITexture;
    let sampler: ISampler;
    loadImage(imageUrl, function (image)
    {
        texture = {
            target: "TEXTURE_2D",
            internalformat: "SRGB8",
            format: "RGB",
            type: "UNSIGNED_BYTE",
            sources: [{ level: 0, source: image }],
        };
        sampler = { minFilter: "NEAREST", magFilter: "NEAREST" };

        render();
    });

    function render()
    {
        // Clear color buffer
        const rp: IRenderPass = {
            passDescriptor: { colorAttachments: [{ clearValue: [0.0, 0.0, 0.0, 1.0], loadOp: "clear" }] },
            renderObjects: [],
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);
        rp.renderObjects.push({
            pipeline: program,
            vertexArray,
            uniforms: {
                mvp: matrix,
                material: { diffuse: { texture, sampler } },
            },
            drawArrays: { vertexCount: 6 },
        });
        WebGL.runRenderPass(rc, rp);

        // Cleanup
        WebGL.deleteBuffer(rc, vertexPosBuffer);
        WebGL.deleteBuffer(rc, vertexTexBuffer);
        WebGL.deleteVertexArray(rc, vertexArray);
        WebGL.deleteTexture(rc, texture);
        WebGL.deleteProgram(rc, program);
    }
})();
