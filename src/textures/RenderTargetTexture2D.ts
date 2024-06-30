import { ITexture } from "../data/ITexture";
import { defaultTexture } from "../runs/runTexture";

const defaultRenderTargetTexture: ITexture = {
    ...defaultTexture,
    size: [1024, 1024],
    format: "RGBA",
    minFilter: "NEAREST",
    magFilter: "NEAREST",
};
