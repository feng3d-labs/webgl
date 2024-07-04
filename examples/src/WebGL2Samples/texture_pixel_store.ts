import { IProgram, IRenderingContext, ISampler, ITexture, IVertexArrayObject, IVertexBuffer } from "../../../src";
import { getShaderSource, loadImage } from "./utility";

(function ()
{
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: IRenderingContext = { canvasId: "glcanvas", contextId: "webgl2", antialias: false };
    const gl = canvas.getContext("webgl2", { antialias: false });

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
        // -- Init Texture
        const texture: ITexture = {
            target: "TEXTURE_2D",
            flipY: false,
        };
        const sampler: ISampler = {};
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, image.width);
        gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, image.width / 4);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, image.height / 4);

        // use canvas to get the pixel data array of the image
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = new Uint8Array(imageData.data.buffer);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width / 2, image.height / 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
        gl.pixelStorei(gl.UNPACK_SKIP_PIXELS, 0);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);

        // -- Render
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        gl.useProgram(program);
        gl.uniformMatrix4fv(mvpLocation, false, matrix);
        gl.uniform1i(diffuseLocation, 0);

        gl.bindVertexArray(vertexArray);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Delete WebGL resources
        gl.deleteBuffer(vertexPosBuffer);
        gl.deleteBuffer(vertexTexBuffer);
        gl.deleteTexture(texture);
        gl.deleteProgram(program);
        gl.deleteVertexArray(vertexArray);
    });
})();
