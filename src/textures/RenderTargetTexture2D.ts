import { watcher } from "@feng3d/watcher";
import { Texture, TextureFormat, TextureMagFilter, TextureMinFilter, defaultTexture } from "../data/Texture";
import { isPowerOfTwo } from "../utils/mathUtils";

const defaultRenderTargetTexture: Texture = {
    ...defaultTexture,
    size: [1024, 1024],
    format: "RGBA",
    minFilter: "NEAREST",
    magFilter: "NEAREST",
};
