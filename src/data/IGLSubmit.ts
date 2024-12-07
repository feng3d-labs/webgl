import { ISubmit } from "@feng3d/render-api";

import { IGLCommandEncoder } from "./IGLCommandEncoder";

/**
 * 一次 GPU 提交。
 */
export interface IGLSubmit extends ISubmit
{
    /**
     * 命令编码器列表。
     */
    commandEncoders: IGLCommandEncoder[];
}