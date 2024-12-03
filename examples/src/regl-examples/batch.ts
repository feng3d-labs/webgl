import { IGLRenderObject, IGLRenderPipeline, IGLVertexArrayObject, WebGL } from "@feng3d/webgl";

const canvas = document.createElement("canvas");
canvas.id = "glcanvas";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const webgl = new WebGL({ canvasId: "glcanvas" });

let batchId = 0;
let tick = 0;
const offsets = [{ offset: [-1, -1] },
{ offset: [-1, 0] },
{ offset: [-1, 1] },
{ offset: [0, -1] },
{ offset: [0, 0] },
{ offset: [0, 1] },
{ offset: [1, -1] },
{ offset: [1, 0] },
{ offset: [1, 1] }];

const pipeline: IGLRenderPipeline = {
    vertex: {
        code: `precision mediump float;
    attribute vec2 position;
    uniform float angle;
    uniform vec2 offset;
    void main() {
      gl_Position = vec4(
        cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
    }` },
    fragment: {
        code: `precision mediump float;
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }` },
    depthStencil: { depth: { depthtest: true } },
};

const vertexArray: IGLVertexArrayObject = {
    vertices: {
        position: {
            buffer: {
                target: "ARRAY_BUFFER",
                data: new Float32Array([
                    0.5, 0,
                    0, 0.5,
                    1, 1
                ])
            }, numComponents: 2
        },
    }
};

function getRenderObject(tick: number, batchId: number)
{
    const renderObject: IGLRenderObject = {
        vertexArray,
        uniforms: {
            color: () => [
                Math.sin(0.02 * ((0.1 + Math.sin(batchId)) * tick + 3.0 * batchId)),
                Math.cos(0.02 * (0.02 * tick + 0.1 * batchId)),
                Math.sin(0.02 * ((0.3 + Math.cos(2.0 * batchId)) * tick + 0.8 * batchId)),
                1],
            angle: () => 0.01 * tick,
            offset: () => offsets[batchId].offset,
        },
        pipeline,
    };

    return renderObject;
}

function draw()
{
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    tick++;
    const renderObjects: IGLRenderObject[] = [];
    for (let i = 0; i < offsets.length; i++)
    {
        batchId = i;
        renderObjects.push(getRenderObject(tick, batchId));
    }

    webgl.runRenderPass({ renderObjects });

    requestAnimationFrame(draw);
}
draw();
