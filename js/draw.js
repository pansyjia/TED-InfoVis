
var data = [];
var val
var talk_categories = ["art"];
var category_colors = {
  "Beautiful": "#5EB731",
  "Courageous": "#5EB731",
  "Fascinating": "#5EB731",
  "Funny": "#5EB731",
  "Informative": "#5EB731",
  "Ingenious": "#5EB731",
  "Inspiring": "#5EB731",
  "Jaw.dropping": "rgb(93, 126, 230)",
  "Persuasive": "#5EB731",
  "Confusing": "#555555",
  "Longwinded": "#555555",
  "Obnoxious": "#555555",
  "Unconvincing": "#555555",
  "OK": "rgb(93, 126, 230)"
}

var selectValue = "3d printing";

$(document).ready(function() {
  console.log("yo");
  loadData1();
  loadData2();
});

// // Loads the CSV file
function loadData1() {
  console.log("HEY");
  // load the csv file
  // assign it to the data variable
  d3.csv("data/ted_clean.csv", function(d) {
    data = d;
    val = data;
    data.sort(function(x, y) { //sort the talks by views
      return d3.ascending(y.views);
    })
    data.forEach(function(d, i) //loop through data rows
      {
        var category = d['tags'].split(',')[0].toLowerCase(); //get category
        if (talk_categories.includes(category) == false) {
          talk_categories.push(category);
          //add category to "talk categories" array if not already there
        }
      });
    setDropdownOptions(data); //set categories to be the dropdown options in the HTML
    console.log(selectValue);
    selectValue = d3.select('select').property('value');
    d3.select('#list').html("");
    console.log(selectValue);
    d3.select('#list')
      .append('p')
      // .text(function() { return getTopTalks(selectValue, data); });
      .html(getTopTalks(selectValue, data));
    //console.log(talk_categories[0]);
    // console.log(getTopTalks('art',data));

    d3.select('.select') //update list on change of category
      .on('change', function() {

        selectValue = d3.select('select').property('value');
        d3.select('#list').html("");
        console.log(selectValue);
        getTopTalks(selectValue, data);

      });

  });

}



/////data for drawing scatter plot
function loadData2() {
    d3.csv("data/ted_ratings.csv", function (d) {
        data = d;
        data.forEach(function (item) {
            item.n = parseInt(item.n);
        });

        drawScatterPlot(data);
    });
}



////////////////////////////////////
/////Small Multiples///////
////////////////////////////////////
function getTopTalks(category, data) {
  console.log(category);
  //set up margin and scale
  var margin = {
      top: 20,
      right: 20,
      bottom: 80,
      left: 60
    },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

  var y = d3.scaleLinear()
    .range([height, 0]);

  var counter = 0;
  var item_array;
  var rating_names = ["Beautiful", "Confusing", "Courageous", "Fascinating", "Funny", "Informative", "Ingenious", "Inspiring", "Jaw.dropping", "Longwinded", "OK", "Obnoxious", "Persuasive", "Unconvincing"]



  data.forEach(function(d, i) {
    var dict = [];

    var category_text = d['tags'].split(',')[0].toLowerCase();


    if (category_text == category && counter <= 4) //if there is a match, display link & tite of talk
    {
      item_array = [];
      var list = "";

      // create dict of rating names and value - > chart data
      for (i = 0; i < rating_names.length; i++) {
        dict.push({
          key: rating_names[i],
          value: parseInt(d[rating_names[i]])
        });
      }
      dict.sort(function(a, b) {
        return b["value"] - a["value"];
      });
      console.log(dict)

      //create list
      list += '<br>';
      list += ("<strong>Title </strong>: " + (d['title']));
      list += '<br>';
      list += (" <strong>Speaker</strong>: " + d['main_speaker']);
      list += '<br>';
      list += (" <strong>Views</strong>: " + d['views']);
      list += '<br>';
      list += (" <a href= " + d['url'] + ">Click to Watch</a>");
      list += '<br>';


      talk_info = d3.select('#list').append("p").attr("class", "talk_info")
      talk_chart = d3.select('#list').append("div").attr("class", "talk_chart")
      item_array.push(list);
      talk_info.html(list);

      var svg = talk_chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(dict.map(function(d) {
        return d.key;
      }));
      y.domain([0, d3.max(dict, function(d) {
        return d.value;
      })]);

      var tooltip = d3.select("body")
        .append("div")
        .attr("class", "toolTip")

      svg.selectAll(".bar")
        .data(dict)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("id", function(d) {
          return d.key;
        })
        .style("fill", function(d) {
          return category_colors[d.key]
        })
        .attr("x", function(d) {
          return x(d.key);
        })
        .attr("width", x.bandwidth())
        .attr("y", function(d) {
          return y(d.value);
        })
        .attr("height", function(d) {
          return height - y(d.value);
        })
        .attr("opacity", "0.6")
        .on("mousemove", function(d) {
          $("[id= '" + d.key + "']").addClass("highlight");
          tooltip
            .style("left", d3.event.pageX - 80 + "px")
            .style("top", d3.event.pageY - 100 + "px")
            .style("display", "inline-block")
            .html("<b>" + (d.key) + "</b> : " + (d.value));
        })
        .on("mouseout", function(d) {
          $("[id= '" + d.key + "']").removeClass("highlight");
          tooltip.style("display", "none");
        });

      // add the x Axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      // add the y Axis
      svg.append("g")
        .call(d3.axisLeft(y));

      counter += 1;
    }
  });
}



function setDropdownOptions(data) {
  //talk_categories.toLowerCase(); //make it all lower case
  talk_categories.sort(); //make alphabetical
  talk_categories.shift();
  talk_categories.shift();
  talk_categories.shift();
  talk_categories.shift();
  console.log(talk_categories);

  var select = d3.select('#container1')
    .append('select')
    .attr('class', 'select')
    .on('change', onchange)

  var options = select
    .selectAll('option')
    .data(talk_categories).enter()
    .append('option')
    .text(function(d, i) {
      return (talk_categories[i]);
    });

}



////////////////////////////////////
/////Scatter Plot///////
function drawScatterPlot(data) {

  // var x="Beautiful";
  // var y="Confusing";

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = $("#scatterTransition3").width()  - margin.left - margin.right,
  height = $("#scatterTransition3").height()  - margin.top - margin.bottom;

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // append the svg obgect to canvas, appends a 'group' element to 'svg'. moves the 'group' element to the top left margin
  var svg = d3.select("#scatterTransition3")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // Scale the range of the data
  x.domain([0, d3.max(data, function(d) { return d.Beautiful; })]);////////replace here/////////
  y.domain([0, d3.max(data, function(d) { return d.Confusing; })]);////////replace here/////////

   ///gradient color -> distance 
  //  var color = d3.scaleSequential(d3.interpolateReds).domain([0,d3.max(data, function(d) { return d.views; })]);

  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // Add the scatterplot
  svg.selectAll("dot")
      .data(data)
      .enter().append("circle")
      .attr("r", 3)
      // .attr("fill", function(d,i) { return color(d.views)})
      .attr("fill", "#e62b1e")
      .attr("cx", function(d) { return x(d.Beautiful); })////////replace here/////////
      .attr("cy", function(d) { return y(d.Confusing); })////////replace here/////////
      .attr("opacity", "1")
      .on("mousemove", function (d) {
              d3.select(this).attr("opacity", "0.7");
              tooltip.style("left", d3.event.pageX - 50 + "px")
                  .style("top", d3.event.pageY - 100 + "px")
                  .style("display", "inline-block")
                  .html("<div><b>" +"Title" + "</b> : " + (d.title) + "</div> " + "<b>" +"Speaker" + "</b> : " + (d.main_speaker));
      })
      .on("mouseout", function (d) {
              d3.select(this).attr("opacity", "1");
              tooltip.style("display", "none");
      });

    // Add the X Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

     // text label for the x axis
     svg.append("text")             
     .attr("transform",
     "translate(" + (width/2) + " ," + 
                    (height + margin.top/2 + 20) + ")")
     .style("text-anchor", "middle")
     .text("Beautiful");

    // Add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
    
    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Confusing"); 


}
