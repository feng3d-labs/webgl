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

    // -- Init program
    const program: IProgram = {
        vertex: { code: getShaderSource("vs") }, fragment: { code: getShaderSource("fs") },
    };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ]);
    const vertexPosBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: positions, usage: "STATIC_DRAW" };

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0
    ]);
    const vertexTexBuffer: IVertexBuffer = { target: "ARRAY_BUFFER", data: texCoords, usage: "STATIC_DRAW" };

    // -- Init VertexArray
    const vertexArray: IVertexArrayObject = {
        vertices: {
            position: { buffer: vertexPosBuffer, numComponents: 2 },
            texcoord: { buffer: vertexTexBuffer, numComponents: 2 },
        }
    };

    loadImage("../../assets/img/Di-3d.png", function (image)
    {
        // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        // gl.pixelStorei(gl.UNPACK_ROW_LENGTH, image.width);
        // gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, image.width / 4);
        // gl.pixelStorei(gl.UNPACK_SKIP_ROWS, image.height / 4);

        // use canvas to get the pixel data array of the image
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = new Uint8Array(imageData.data.buffer);

        // -- Init Texture
        const texture: ITexture = {
            target: "TEXTURE_2D",
            pixelStore: {
                flipY: false,
            },
            internalformat: "RGBA",
            format: "RGBA",
            sources: [{ level: 0, width: image.width / 2, height: image.height / 2, pixels }]
        };
        const sampler: ISampler = {
            minFilter: "NEAREST",
            magFilter: "NEAREST",
        };

        // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        // gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
        // gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
        // gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);

        // -- Render
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
                MVP: matrix,
                diffuse: { texture, sampler },
            },
            drawArrays: { vertexCount: 6 },
        });

        WebGL.runRenderPass(rc, rp);

        // Delete WebGL resources
        WebGL.deleteBuffer(rc, vertexPosBuffer);
        WebGL.deleteBuffer(rc, vertexTexBuffer);
        WebGL.deleteTexture(rc, texture);
        WebGL.deleteProgram(rc, program);
        WebGL.deleteVertexArray(rc, vertexArray);
    });
})();
