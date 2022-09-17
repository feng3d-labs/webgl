import { fit } from './hughsk/canvas-fit';
import { attachCamera } from './hughsk/canvas-orbit-camera';
import { resl } from './mikolalysenko/resl';
import * as mat4 from './stackgl/gl-mat4';
import * as vec3 from './stackgl/gl-vec3';

import { BufferAttribute, RenderAtomic, Texture, WebGLRenderer } from '../../../src';

const canvas = document.createElement('canvas');
canvas.id = 'glcanvas';
canvas.style.position = 'fixed';
canvas.style.left = '0px';
canvas.style.top = '0px';
canvas.style.width = '100%';
canvas.style.height = '100%';
document.body.appendChild(canvas);

const camera = attachCamera(canvas);
window.addEventListener('resize', fit(canvas), false);

// configure intial camera view.
camera.view(mat4.lookAt([], [0, 3.0, 30.0], [0, 0, -5.5], [0, 1, 0]));
camera.rotate([0.0, 0.0], [3.14 * 0.15, 0.0]);

const uv = [];
const elements = [];
const position = [];
const oldPosition = [];
const normal = [];
const constraints: Constraint[] = [];

// create a constraint between the vertices with the indices i0 and i1.
function Constraint(i0, i1)
{
    this.i0 = i0;
    this.i1 = i1;

    this.restLength = vec3.distance(position[i0], position[i1]);
}

const size = 5.5;
const xmin = -size;
const xmax = Number(size);
const ymin = -size;
const ymax = Number(size);

// the tesselation level of the cloth.
const N = 20;

let row;
let col;

// create cloth vertices and uvs.
for (row = 0; row <= N; ++row)
{
    const z = (row / N) * (ymax - ymin) + ymin;
    const v = row / N;

    for (col = 0; col <= N; ++col)
    {
        const x = (col / N) * (xmax - xmin) + xmin;
        const u = col / N;

        position.push([x, 0.0, z]);
        oldPosition.push([x, 0.0, z]);
        uv.push([u, v]);
    }
}

const positionBuffer = regl.buffer({
    length: position.length * 3 * 4,
    type: 'float',
    usage: 'dynamic'
});

let i; let i0; let i1; let i2; let
    i3;

// for every vertex, create a corresponding normal.
for (i = 0; i < position.length; ++i)
{
    normal.push([0.0, 0.0, 0.0]);
}

const normalBuffer = regl.buffer({
    length: normal.length * 3 * 4,
    type: 'float',
    usage: 'dynamic'
});

// create faces
for (row = 0; row <= (N - 1); ++row)
{
    for (col = 0; col <= (N - 1); ++col)
    {
        i = row * (N + 1) + col;

        i0 = i + 0;
        i1 = i + 1;
        i2 = i + (N + 1) + 0;
        i3 = i + (N + 1) + 1;

        elements.push([i3, i1, i0]);
        elements.push([i0, i2, i3]);
    }
}

// create constraints
for (row = 0; row <= N; ++row)
{
    for (col = 0; col <= N; ++col)
    {
        i = row * (N + 1) + col;

        i0 = i + 0;
        i1 = i + 1;
        i2 = i + (N + 1) + 0;
        i3 = i + (N + 1) + 1;

        // add constraint linked to the element in the next column, if it exist.
        if (col < N)
        {
            constraints.push(new Constraint(i0, i1));
        }

        // add constraint linked to the element in the next row, if it exists
        if (row < N)
        {
            constraints.push(new Constraint(i0, i2));
        }

        // add constraint linked the next diagonal element, if it exists.
        if (col < N && row < N)
        {
            constraints.push(new Constraint(i0, i3));
        }
    }
}

const positions = cubePosition.reduce((pv: number[], cv: number[]) =>
{
    cv.forEach((v) => { pv.push(v); });

    return pv;
}, []);

const uvs = cubeUv.reduce((pv: number[], cv: number[]) =>
{
    cv.forEach((v) => { pv.push(v); });

    return pv;
}, []);

const indices = cubeElements.reduce((pv: number[], cv: number[]) =>
{
    cv.forEach((v) => { pv.push(v); });

    return pv;
}, []);

const webglRenderer = new WebGLRenderer({ canvas: canvas });

let diffuse: gPartial<Texture<any>>;

let tick = 0;
let viewportWidth = 1;
let viewportHeight = 1;

const renderAtomic = new RenderAtomic({
    attributes: {
        position: new BufferAttribute(new Float32Array(positions), 3) as any,
        uv: new BufferAttribute(new Float32Array(uvs), 2) as any,
    },
    index: new BufferAttribute(new Uint16Array(indices), 1) as any,
    uniforms: {
        view: () =>
        {
            const t = 0.01 * tick;

            return mat4.lookAt([],
                [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)],
                [0, 0.0, 0],
                [0, 1, 0]);
        },
        projection: () =>
            mat4.perspective([],
                Math.PI / 4,
                viewportWidth / viewportHeight,
                0.01,
                10),
        tex: () => diffuse,
    },
    renderParams: { cullFace: 'NONE', enableBlend: true },
    shader: {
        vertex: `precision mediump float;
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUv;
        uniform mat4 projection, view;
        void main() {
          vUv = uv;
          gl_Position = projection * view * vec4(position, 1);
        }`,
        fragment: `precision mediump float;
        varying vec2 vUv;
        uniform sampler2D tex;
        void main () {
          gl_FragColor = texture2D(tex,vUv);
        }` }
});

function draw()
{
    tick++;

    viewportWidth = canvas.width = canvas.clientWidth;
    viewportHeight = canvas.height = canvas.clientHeight;

    webglRenderer.render(renderAtomic);
    requestAnimationFrame(draw);
}

resl({
    manifest: {
        texture: {
            type: 'image',
            src: 'resources/assets/peppers.png',
        }
    },
    onDone: ({ texture }) =>
    {
        diffuse = {
            flipY: false,
            textureType: 'TEXTURE_2D',
            format: 'RGBA',
            type: 'UNSIGNED_BYTE',
            magFilter: 'LINEAR',
            minFilter: 'LINEAR',
            activePixels: texture as any,
        };

        draw();
    }
});
