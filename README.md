# @feng3d/webgl

feng3d引擎的WebGL渲染器，可以让用户无需直接接触WebGL的API，只需提供渲染所需数据，组织好渲染数据结构便可渲染，并且支持动态修改数据从而实现动态渲染。

## 示例

[@feng3d/webgl示例](https://feng3d.com/webgl/)

这里实现完整的 [webgl1](https://mdn.github.io/dom-examples/webgl-examples/tutorial/sample1/) [webgl2](https://github.com/WebGLSamples/WebGL2Samples.git) 官方示例(https://github.com/webgpu/webgpu-samples)。

## 安装
```
npm i @feng3d/webgl@0.0.3
```

## 如何使用

```typescript
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
```

## 不再支持内容
1. 为了兼容WebGPU，GLSL着色器中数据结构不再支持纹理。
    如下GLSL着色器中struct中包含sampler2D
    ```
    struct Material
    {
        sampler2D diffuse[2];
    };

    uniform Material material;
    ```
    需要修改为
    ```
    uniform sampler2D materialDiffuse0;
    uniform sampler2D materialDiffuse1;
    ```
