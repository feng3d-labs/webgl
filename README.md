# @feng3d/renderer


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
