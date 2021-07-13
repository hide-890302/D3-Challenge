// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 660;

var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
  };

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(data) {

  
    // parse data
    data.forEach(function(d) {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.age = +d.age;
        d.income = +d.income;
      });

    // create array for x and y axis labels
    var xLables = [{label: "In Poverty (%)", value: "poverty"}, {label: "Age(Median)", value:"age"}, {label: "Household Income (Median)", value: "income"}];
    var yLables = [{label: "Obese (%)", value: "obesity"}, {label: "Smokes (%)", value:"smokes"}, {label: "Lacks Healthcare (%)", value: "healthcare"}];

    // set default parameters
    var valuex = "poverty";
    var valuey = "healthcare";


  // Set xLinearScale function
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d =>d[valuex])*0.9,d3.max(data, d =>d[valuex])*1.1])
    .range([0,chartWidth]);

  // Set yLinearScale function
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d =>d[valuey])*0.9,d3.max(data, d =>d[valuey])*1.1])
    .range([chartHeight,0]);

  // Set initial axis functions
  var yAxis = d3.axisLeft(yLinearScale);
  var xAxis = d3.axisBottom(xLinearScale);

  // append y axis
  chartGroup.append("g")
    .attr("class", "yaxis")
    .call(yAxis);

  // append x axis
  chartGroup.append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(xAxis);

  // append initial circles as scatter plots
  var circlesGroup = chartGroup.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[valuex])  )
    .attr("cy", d => yLinearScale(d[valuey]) )
    .attr("r", 15)
    .attr("opacity", ".7")
    .style("fill", "#6A5ACD");

  // append state abbreviation to each data plot
  var stateText = chartGroup.append("g")
    .attr("class", "stateText")
    .attr("font-size", 10)
    .selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[valuex]))
    .attr("y", d => yLinearScale(d[valuey]))
    .text(d => d.abbr);

  // set x axis labels
  chartGroup.append('g')
    .attr("text-anchor", "middle")
    .attr("font-size",15)
    .attr("fill","black")
    .selectAll("text")
    .data(xLables)
    .enter()
    .append("text")
    .attr("y",(d,i)=>chartHeight)
    .attr("x",chartWidth/2)
    .attr("dy",(d,i) => (2+i)+"em")
    .attr("class",d => d.value === valuex ? "aText active" : "aText inactive")
    .attr("id","xs")
    .text(d => d.label)
    .on("click", function(d) { d3.selectAll("#xs").attr("class","aText inactive"), d3.select(this).attr("class","aText active"), valuex = d.value, updateXAxis()});

  // set y axis label
  chartGroup.append('g')
    .attr("text-anchor", "middle")
    .attr("font-size",15)
    .attr("fill","black")
    .selectAll("text")
    .data(yLables)
    .enter()
    .append('text')
    .attr("x", -chartWidth/4)
    .attr("y",(d,i) => -margin.bottom/1.5)
    .attr("dy",(d,i) => i+"em") // ?
    .attr("transform","rotate(-90)")
    .attr("class",d => d.value === valuey ? "aText active" : "aText inactive")
    .attr("id","ys")
    .html(d => d.label)
    .on("click", function(d) {d3.selectAll("#ys").attr("class","aText inactive"), d3.select(this).attr("class","aText active"), valuey = d.value, updateYAxis()});



  // initialize tooltip
  var toolTip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
      return (`${d.state}<br> ${valuex} : ${d[valuex]} ${valuex === "age"| valuex === "income" ? "" : "%"} <br> ${valuey} : ${d[valuey]}%`)});

  // add tooltip to chart
  chartGroup.call(toolTip);

  // mouseover to display tip
  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d, this)
    d3.select(this).style("stroke","")
  });

  // mouseout to hide tip
  circlesGroup.on("mouseout", function(d) {
    toolTip.hide(d)
    d3.select(this).style("stroke",null)
  });


  // function to update chart based on x Axis label selection
  // circlesGroup
  function updateXAxis() {
    xLinearScale.domain([d3.min(data, d =>d[valuex])*0.9,d3.max(data, d =>d[valuex])*1.1])
    chartGroup.select(".xaxis")
    .transition()
    .duration(500)
    .call(xAxis);

    circlesGroup.data(data)
    .transition()
    .duration(500)
    .attr("cx", d => xLinearScale(d[valuex]));
    
    stateText.data(data)
    .transition()
    .duration(500)
    .attr("x", d => xLinearScale(d[valuex]));

    toolTip
    .html(function(d) {
        
        return (`${d.state}<br> ${valuex} : ${d[valuex]} ${valuex === "age"| valuex === "income" ? "" : "%"} <br> ${valuey} : ${d[valuey]}%`)})
};

  // function to update chart based on y Axis label selection
  function updateYAxis() {
      
      yLinearScale.domain([d3.min(data, d =>d[valuey])*0.9,d3.max(data, d =>d[valuey])*1.1])
      chartGroup.select(".yaxis")
      .transition()
      .duration(500)
      .call(yAxis);

      circlesGroup.data(data)
      .transition()
      .duration(500)
      .attr("cy", d => yLinearScale(d[valuey]));
      
      stateText.data(data)
      .transition()
      .duration(500)
      .attr("y", d => yLinearScale(d[valuey]));

      toolTip
      .html(function(d) {
        return (`${d.state}<br> ${valuex} : ${d[valuex]} ${valuex === "age"| valuex === "income" ? "" : "%"} <br> ${valuey} : ${d[valuey]}%`)});
    };


});