import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import { colorLightShade1, themes, TypeTheme } from 'preshape';
import { TypeColorScale } from '../Types';

export const colorScales: TypeColorScale[] = [
  'Plasma',
  'Preshape Theme',
  'RdPu',
  'Spectral',
  'Viridis',
  'YlGnBu',
];

export default (scale: TypeColorScale, theme: TypeTheme) => {
  switch (scale) {
    case 'Plasma': return d3ScaleChromatic.interpolatePlasma;
    case 'RdPu': return d3ScaleChromatic.interpolateRdBu;
    case 'Spectral': return d3ScaleChromatic.interpolateSpectral;
    case 'Viridis': return d3ScaleChromatic.interpolateViridis;
    case 'YlGnBu': return d3ScaleChromatic.interpolateYlGnBu;
    case 'Preshape Theme':
    default: {
      return d3Scale.scaleLinear<string>()
        .domain([0, 1])
        .range([colorLightShade1, themes[theme].colorAccentShade3]);
    }
  }
};
