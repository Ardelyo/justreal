
import React, { useEffect, useRef } from 'react';
import { AnalysisResult } from '@/types/analysis';

// Import d3 and motion with fallbacks
let d3: any;
let motion: any;

try {
  d3 = require('d3');
} catch {
  // Fallback if d3 is not available
  d3 = null;
}

try {
  const framerMotion = require('framer-motion');
  motion = framerMotion.motion;
} catch {
  // Fallback if framer-motion is not available
  motion = {
    div: ({ children, className, ...props }: any) => <div className={className}>{children}</div>
  };
}

interface D3SentimentChartProps {
  results: AnalysisResult[];
  width?: number;
  height?: number;
}

const D3SentimentChart: React.FC<D3SentimentChartProps> = ({
  results,
  width = 800,
  height = 400
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || results.length === 0 || !d3) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Process data for sentiment flow over time
    const sentimentData = results.map((result, index) => ({
      index,
      sentiment: result.sentimen_umum,
      positif: result.skor_kepercayaan.POSITIF,
      negatif: result.skor_kepercayaan.NEGATIF,
      netral: result.skor_kepercayaan.NETRAL,
      toksisitas: result.tingkat_toksisitas,
      comment: result.original_comment
    }));

    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, results.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(['POSITIF', 'NEGATIF', 'NETRAL'])
      .range(['#16a34a', '#dc2626', '#6b7280']);

    // Create gradient definitions
    const defs = svg.append('defs');
    
    const gradientPositif = defs.append('linearGradient')
      .attr('id', 'gradientPositif')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', 0).attr('y2', 0);
    
    gradientPositif.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#16a34a')
      .attr('stop-opacity', 0.1);
    
    gradientPositif.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#16a34a')
      .attr('stop-opacity', 0.6);

    // Line generators - Fixed: removed type arguments from untyped functions
    const positifLine = d3.line()
      .x((d: any) => xScale(d.index))
      .y((d: any) => yScale(d.positif))
      .curve(d3.curveCardinal);

    const negatifLine = d3.line()
      .x((d: any) => xScale(d.index))
      .y((d: any) => yScale(d.negatif))
      .curve(d3.curveCardinal);

    const netralLine = d3.line()
      .x((d: any) => xScale(d.index))
      .y((d: any) => yScale(d.netral))
      .curve(d3.curveCardinal);

    // Area generator for positive sentiment - Fixed: removed type arguments
    const area = d3.area()
      .x((d: any) => xScale(d.index))
      .y0(innerHeight)
      .y1((d: any) => yScale(d.positif))
      .curve(d3.curveCardinal);

    // Add area
    g.append('path')
      .datum(sentimentData)
      .attr('fill', 'url(#gradientPositif)')
      .attr('d', area)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    // Add lines
    const lines = [
      { data: sentimentData, line: positifLine, color: '#16a34a', name: 'Positif' },
      { data: sentimentData, line: negatifLine, color: '#dc2626', name: 'Negatif' },
      { data: sentimentData, line: netralLine, color: '#6b7280', name: 'Netral' }
    ];

    lines.forEach((lineConfig, i) => {
      const path = g.append('path')
        .datum(lineConfig.data)
        .attr('fill', 'none')
        .attr('stroke', lineConfig.color)
        .attr('stroke-width', 3)
        .attr('d', lineConfig.line);

      // Animate line drawing
      const totalLength = path.node()!.getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .delay(i * 200)
        .attr('stroke-dashoffset', 0);
    });

    // Add interactive dots
    const dots = g.selectAll('.dot')
      .data(sentimentData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: any) => xScale(d.index))
      .attr('cy', (d: any) => yScale(d.positif))
      .attr('r', 0)
      .attr('fill', (d: any) => colorScale(d.sentiment) as string)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Animate dots
    dots.transition()
      .duration(800)
      .delay((d: any, i: number) => i * 50)
      .attr('r', 6);

    // Add tooltip
    const tooltip = d3.select('body').select('.d3-tooltip');
    if (tooltip.empty()) {
      d3.select('body').append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('font-size', '12px')
        .style('z-index', 1000);
    }

    dots
      .on('mouseover', function(event: any, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 10);

        d3.select('.d3-tooltip')
          .transition()
          .duration(200)
          .style('opacity', 1)
          .html(`
            <strong>Komentar #${d.index + 1}</strong><br/>
            Sentimen: ${d.sentiment}<br/>
            Positif: ${(d.positif * 100).toFixed(1)}%<br/>
            Negatif: ${(d.negatif * 100).toFixed(1)}%<br/>
            Toksisitas: ${(d.toksisitas * 100).toFixed(1)}%<br/>
            <em>${d.comment.substring(0, 50)}...</em>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);

        d3.select('.d3-tooltip')
          .transition()
          .duration(200)
          .style('opacity', 0);
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d: any) => `#${d + 1}`);
    
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format('.0%'));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#888');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#888');

    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#888')
      .text('Skor Kepercayaan');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', '#888')
      .text('Urutan Komentar');

    // Legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 100}, 20)`);

    lines.forEach((lineConfig, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', lineConfig.color);

      legendRow.append('text')
        .attr('x', 18)
        .attr('y', 6)
        .attr('dy', '0.35em')
        .style('fill', '#888')
        .style('font-size', '12px')
        .text(lineConfig.name);
    });

    // Cleanup function
    return () => {
      d3.select('.d3-tooltip').remove();
    };
  }, [results, width, height]);

  // Fallback if D3 is not available
  if (!d3) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-justreal-dark p-4 rounded-lg border border-justreal-gray"
      >
        <div className="text-center text-justreal-white">
          <h3 className="text-lg font-semibold mb-2">Sentiment Flow Chart</h3>
          <p className="text-justreal-gray-light">
            D3.js visualization will be available once the library is loaded.
          </p>
          <div className="mt-4 space-y-2">
            {results.slice(0, 5).map((result, index) => (
              <div key={index} className="text-left p-2 bg-justreal-black rounded">
                <div className="text-sm text-justreal-white">
                  Komentar #{index + 1}: {result.sentimen_umum}
                </div>
                <div className="text-xs text-justreal-gray-light">
                  Positif: {(result.skor_kepercayaan.POSITIF * 100).toFixed(1)}% | 
                  Negatif: {(result.skor_kepercayaan.NEGATIF * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-justreal-dark p-4 rounded-lg border border-justreal-gray"
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto"
      />
    </motion.div>
  );
};

export default D3SentimentChart;
