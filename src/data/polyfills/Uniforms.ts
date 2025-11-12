import { } from '@feng3d/render-api';
import { SamplerTexture } from '../SamplerTexture';

declare module '@feng3d/render-api'
{
    export interface BindingResourceTypeMap
    {
        GLSamplerTexture: SamplerTexture;
    }
}
