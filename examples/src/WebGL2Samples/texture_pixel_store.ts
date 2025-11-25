import { Buffer, CanvasContext, IndicesDataTypes, RenderPass, RenderPassObject, RenderPipeline, Sampler, Texture, VertexAttributes, VertexData } from '@feng3d/render-api';
import { WebGL } from '@feng3d/webgl';
import { getShaderSource, loadImage } from './utility';

(function ()
{
    const canvas = document.createElement('canvas');
    canvas.id = 'glcanvas';
    canvas.width = Math.min(window.innerWidth, window.innerHeight);
    canvas.height = canvas.width;
    document.body.appendChild(canvas);

    const rc: CanvasContext = { canvasId: 'glcanvas', webGLcontextId: 'webgl2', webGLContextAttributes: { antialias: false } };
    const webgl = new WebGL(rc, {
        clearColorValue: [0.0, 0.0, 0.0, 1.0],
        loadColorOp: 'clear',
    });

    // -- Init program
    const program: RenderPipeline = {
        vertex: { code: getShaderSource('vs') }, fragment: { code: getShaderSource('fs') },
    };

    // -- Init buffers: vec2 Position, vec2 Texcoord
    const positions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0, 1.0,
        1.0, 1.0,
        -1.0, 1.0,
        -1.0, -1.0,
    ]);
    const vertexPosBuffer: VertexData = positions;

    const texCoords = new Float32Array([
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 0.0,
        0.0, 0.0,
        0.0, 1.0,
    ]);
    const vertexTexBuffer: VertexData = texCoords;

    // -- Init VertexArray
    const vertexArray: { vertices?: VertexAttributes, indices?: IndicesDataTypes } = {
        vertices: {
            position: { data: vertexPosBuffer, format: 'float32x2' },
            texcoord: { data: vertexTexBuffer, format: 'float32x2' },
        },
    };

    loadImage('../../assets/img/Di-3d.png', function (image)
    {
        // use canvas to get the pixel data array of the image
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const pixels = new Uint8Array(imageData.data.buffer);

        // -- Init Texture
        const texture: Texture = {
            descriptor: {
                size: [image.width / 2, image.height / 2],
                format: 'rgba8unorm',
            },
            sources: [{
                __type__: 'TextureDataSource',
                mipLevel: 0,
                size: [image.width / 2, image.height / 2],
                data: pixels,
                dataLayout: { width: image.width },
                dataImageOrigin: [image.width / 4, image.width / 4],
            }],
        };
        const sampler: Sampler = {
            minFilter: 'nearest',
            magFilter: 'nearest',
        };

        const renderObjects: RenderPassObject[] = [];
        // -- Render
        const rp: RenderPass = {
            renderPassObjects: renderObjects,
        };

        const matrix = new Float32Array([
            0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ]);

        renderObjects.push({
            pipeline: program,
            bindingResources: {
                MVP: { value: matrix },
                diffuse: { texture, sampler },
            },
            vertices: vertexArray.vertices,
            indices: vertexArray.indices,
            draw: { __type__: 'DrawVertex', vertexCount: 6 },
        });

        webgl.submit({ commandEncoders: [{ passEncoders: [rp] }] });

        // Delete WebGL resources
        webgl.deleteBuffer(Buffer.getBuffer(vertexPosBuffer.buffer));
        webgl.deleteBuffer(Buffer.getBuffer(vertexTexBuffer.buffer));
        webgl.deleteTexture(texture);
        webgl.deleteProgram(program);
    });
})();
