async function draw() {

  const numberFormatter = new Intl.NumberFormat('en-GB')

  const data = await d3.csv('provisional-results.csv')
  const map = await d3.json('admin_1.json')
  const regionAbbreviations = ['AH','AR','BO','BE','CE','EA','GA','NE','NO','OT','SA','UE','UW','VO','WE','WN']
  const winningParty = []
  console.log(map.objects.admin_1.geometries)

  data.forEach( d => {
    if (+d.NDC > +d.NPP) {
      winningParty.push('NDC')
    } else { 
      winningParty.push('NPP')
    }
  })

  let i = 0;
  (map.objects.admin_1.geometries).forEach( d => {
    (d.properties).winningParty = winningParty[i];
    (d.properties).NPP = +data[i].NPP;
    (d.properties).NDC = +data[i].NDC;
    i++
  })
  
  const width = 500
  const height = 500

  const mapProjection = d3.geoMercator()
    .center([6, 4]) 
    .scale(2000)
    .rotate([0, 0, 0]);

  const svg = d3.select('#map')
    .append('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('style', 'max-width: 100%; height: auto;')

  const pathGenerator = d3.geoPath()
    .projection(mapProjection)

  const chart = svg.append('g') 

  const regionColour = (d) => {
    if (d.properties.winningParty === 'NDC') {
      return '#2d693e'
    } else {
      return '#142a75'
    }
  }

  const tooltip = d3.select('.tooltip')
  const region = d3.select('.region')
  const winner = d3.select('.winner')
  const runnerUp = d3.select('.runner_up')

  // tooltip
  const pointerenter = (d,i) => {
    tooltip.style('display', 'block')
      .style("top", d.pageY - 90 + "px")
      .style("left", d.pageX + 20 + "px")
    region.text(i.properties.shapeName)
    winner.text((i.properties.NPP > i.properties.NDC) ? `NPP: ${new Intl.NumberFormat().format(i.properties.NPP)}` : `NDC: ${new Intl.NumberFormat().format(i.properties.NDC)}`)
    runnerUp.text((i.properties.NPP < i.properties.NDC) ? `NPP: ${new Intl.NumberFormat().format(i.properties.NPP)}` : `NDC: ${new Intl.NumberFormat().format(i.properties.NDC)}`)
  };

  const pointerleave = function(d,i) {
    tooltip.style('display', 'none')
  };

  // map
  chart.selectAll('path')
    .data(topojson.feature(map, map.objects.admin_1).features)
    .join('path')
    .attr('fill', regionColour)
    .attr('stroke', 'white')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-width', 0.25)
    .attr('d', pathGenerator)
    .on('pointermove', pointerenter)
    .on('pointerleave', pointerleave)
    
    chart.selectAll("text")
      .data(topojson.feature(map, map.objects.admin_1).features)
      .enter()
      .append("text")
      .text(d => d.properties.shapeName.replace('Region',''))
      .attr("x", (d) => {
        return pathGenerator.centroid(d)[0] - 10
      })
       .attr("y", (d) => {
        return pathGenerator.centroid(d)[1]
       })
      .attr("fill", "white")
      .attr("stroke", "white")
      .attr("stroke-width", 0.05)
      .attr('class','region-label')
      .attr('width', 12)
      

  // legend
  const legend = chart.append('g')
    .style('font-size', '0.5rem')
    .style('font-family', 'sans-serif')
    .attr('transform', 'translate(150,40)')

  const ndcLabelColorSquare = legend.append('rect')
    .attr('x', 10)
    .attr('y', 120)
    .attr('width', 12)
    .attr('height', 8)
    .attr('fill', '#2d693e')
    .attr('transform', 'translate( 173, -143.5)')
    
  const ndcLabel = legend.append('text')
    .style('font-weight', 'bold')
    .text('NDC - National Democratic Congress')
    .attr('transform', 'translate( 198, -16.5)')

  const ndppLabelColorSquare = legend.append('rect')
    .attr('x', 10)
    .attr('y', 120)
    .attr('width', 12)
    .attr('height', 8)
    .attr('fill', '#142a75')
    .attr('transform', 'translate( 173, -127)')

  const nppLabel = legend.append('text')
    .style('font-weight', 'bold')
    .text('NPP - National Patriotic Party')
    .attr('transform', 'translate( 198, 0)')
}

draw()