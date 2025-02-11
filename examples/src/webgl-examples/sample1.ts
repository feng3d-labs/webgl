import { ISubmit } from "@feng3d/render-api";
import { WebGL } from "@feng3d/webgl";

const init = async (canvas: HTMLCanvasElement) =>
{
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    const webgl = new WebGL({ canvasId: "glcanvas", contextId: "webgl" }); // 初始化WebGL

    const submit: ISubmit = { // 一次GPU提交
        commandEncoders: [ // 命令编码列表
            {
                passEncoders: [ // 通道编码列表
                    { // 渲染通道
                        descriptor: { // 渲染通道描述
                            colorAttachments: [{ // 颜色附件
                                clearValue: [0.0, 0.0, 0.0, 1.0], // 渲染前填充颜色
                            }],
                        },
                        renderObjects: [{ // 渲染对象
                            pipeline: { // 渲染管线
                                vertex: { // 顶点着色器
                                    code: `
                                    attribute vec4 position;

                                    void main() {
                                        gl_Position = position;
                                    }
                                    ` },
                                fragment: { // 片段着色器
                                    code: `
                                    precision highp float;
                                    uniform vec4 color;
                                    void main() {
                                        gl_FragColor = color;
                                        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                                    }
                                    ` },
                            },
                            vertices: {
                                position: { data: new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]), format: "float32x2" }, // 顶点坐标数据
                            },
                            indices: new Uint16Array([0, 1, 2]), // 顶点索引数据
                            uniforms: { color: [1, 0, 0, 1] }, // Uniform 颜色值。
                            drawIndexed: { indexCount: 3 }, // 绘制命令
                        }]
                    },
                ]
            }
        ],
    };

    webgl.submit(submit); // 提交GPU执行
};

let webglCanvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
if (!webglCanvas)
{
    webglCanvas = document.createElement("canvas");
    webglCanvas.id = "webgpu";
    webglCanvas.style.width = "400px";
    webglCanvas.style.height = "300px";
    document.body.appendChild(webglCanvas);
}
init(webglCanvas);