
var f = d3.format(".1f");
var data = [];
var val
var talk_categories = ["art"];
var category_colors = {
  "Beautiful": "#e62b1e",
  "Courageous": "#e62b1e",
  "Fascinating": "#e62b1e",
  "Funny": "#e62b1e",
  "Informative": "#e62b1e",
  "Ingenious": "#e62b1e",
  "Inspiring": "#e62b1e",
  "Jaw.dropping": "#feac9d",
  "Persuasive": "#e62b1e",
  "Confusing":"#888888",
  "Longwinded": "#888888",
  "Obnoxious": "#888888",
  "Unconvincing": "#888888",
  "OK": "#feac9d"
}


var rating_names = ["Beautiful", "Confusing", "Courageous", "Fascinating", "Funny", "Informative", "Ingenious", "Inspiring", "Jaw.dropping", "Longwinded", "OK", "Obnoxious", "Persuasive", "Unconvincing"]

var selectValue = "3d printing";
//var selectBtn = "history";
var xrating = "Informative"
var yrating = "Funny"

$(document).ready(function() {
  // console.log("loaddata begin");
  loadData1();
  loadData2();
});


// // Loads the CSV file
function loadData1() {
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

    // console.log(selectValue);
    selectValue = d3.select('select').property('value');
    d3.select('#list').html("");
    // console.log(selectValue);
    d3.select('#list')
      .append('p')
      .html(getTopTalks(selectValue, data));

    d3.select('.select') //update list on change of category
      .on('change', function() {
        selectValue = d3.select('select').property('value');
        d3.select('#list').html("");
        console.log(selectValue);
        getTopTalks(selectValue, data);
      });

      // console.log(selectBtn);
      // selectBtn = d3.select('button').property('value');
      // d3.select('#list').html("");
      // d3.select('#list')
      //   .append('p')
      //   .html(getTopTalks(selectBtn, data));



  });

}




/////data for drawing scatter plot
function loadData2() {

    d3.csv("data/ted_ratings.csv", function (d) {
        data2 = d;
        data2.forEach(function (talk) {
            talk.Beautiful = parseInt(talk.Beautiful);
            talk.Confusing = parseInt(talk.Confusing);
            talk.Courageous = parseInt(talk.Courageous);
            talk.Fascinating = parseInt(talk.Fascinating);
            talk.Funny = parseInt(talk.Funny);
            talk.Informative = parseInt(talk.Informative);
            talk.Ingenious = parseInt(talk.Ingenious);
            talk.Inspiring = parseInt(talk.Inspiring);
            talk["Jaw.dropping"] = parseInt(talk["Jaw.dropping"]);
            talk.Longwinded = parseInt(talk.Longwinded);
            talk.OK = parseInt(talk.OK);
            talk.Obnoxious = parseInt(talk.Obnoxious);
            talk.Persuasive = parseInt(talk.Persuasive);
            talk.Unconvincing = parseInt(talk.Unconvincing);

            talk.main_rating = parseInt(talk.main_rating);
            talk.views = parseInt(talk.views);
            talk.N_views = parseInt(talk.N_views);
        });

    drawScatterPlot(data2,xrating,yrating);

    });

    d3.selectAll('.dropdown') //update list on change of category
      .on('change', function() {


        var comparex = d3.select('#xaxis').property('value');
        var comparey = d3.select('#yaxis').property('value');
        console.log(comparex, comparey);
        drawScatterPlot(data2,comparex,comparey)


      });



}



//////////////////////////////////////////////////////////////////
/////Small Multiples///////
///////////////////////////////////////////////////////////////////
function getTopTalks(category, data) {
  console.log(category);

  //set up margin and scale
  var margin = {
      top: 10,
      right: 10,
      bottom: 80,
      left: 50
    },
    width = 350 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

  var x = d3.scaleBand().range([0, width]).padding(0.1);

  var y = d3.scaleLinear().range([height, 0]);

  var counter = 0;
  var item_array;

  data.forEach(function(d, i) {
    var dict = [];

    var category_text = d['tags'].split(',')[0].toLowerCase();


    if (category_text == category && counter <= 5) //if there is a match, display link & tite of talk
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
      // console.log(dict)

      //create list
      list += '<br>';
      list += ("<strong>Title</strong>: " + (d['title']));
      list += '<br>';
      list += (" <strong>Speaker</strong>: " + d['main_speaker']);
      list += '<br>';
      list += (" <strong>Views</strong>: " + d['views']);
      list += '<br>';
      list += (" <a href= " + d['url'] + ">Click to Watch</a>");
      list += '<br>';

      one_talk = d3.select('#list').append("div").attr("class", "two column").attr("class", "one-talk")
      talk_info =  one_talk.append("p").attr("class", "talk_info")
      talk_chart =  one_talk.append("div").attr("class", "talk_chart")
      // talk_info =  d3.select('#container1').append("p").attr("class", "talk_info")
      // talk_chart =  d3.select('#container1').append("div").attr("class", "talk_chart")
      item_array.push(list);
      talk_info.html(list);

      var svg = talk_chart.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(dict.map(function(d) {return d.key;}));
      y.domain([0, d3.max(dict, function(d) {return d.value; })]);

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
        .attr("opacity", "0.8")
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



//////////////////////////////////////////////////////////////////
/////Scatter Plot///////
//////////////////////////////////////////////////////////////////
function drawScatterPlot(data2,x,y) {
  $("#scatterTransition3").empty();

  xrating = x;
  yrating = y;
  console.log(xrating,yrating)

  var margin = {top: 20, right: 20, bottom: 30, left: 60},
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
  x.domain([0, d3.max(data2, function(d) {return d[xrating]; })]);////////replace here/////////
  y.domain([0, d3.max(data2, function(d) { return d[yrating]; })]);////////replace here/////////


   ///gradient color -> distance
  // var color = d3.scaleSequential(d3.interpolateViridis).domain([0,d3.max(data, function(d) { return d.views; })]);
  color = d3.scaleLinear().domain([0, d3.max(data2, function(d) { return d.views; })])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("#9ddff2"), d3.rgb("#f70707")]);

//   const logScale = d3.scaleLog()
//   .domain([1, 1000])
// const colorScaleLog = d3.scaleSequential(
//     (d) => d3.interpolateReds(logScale(d))
//   )


  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // Add the scatterplot
  svg.selectAll("dot")
      .data(data2)
      .enter().append("circle")
      // .attr("r", 3)
      //.attr("r", function(d){return Math.sqrt((d.views)/200000)})
      .attr("r", 6)
      .attr("fill", function(d) { return color(d.views)})
      .style("opacity","0.5")
      // .attr("fill", "#e62b1e")
      .attr("cx", function(d) { return x(d[xrating]); })////////replace here/////////
      .attr("cy", function(d) { return y(d[yrating]); })////////replace here/////////
      .attr("opacity", "1")
      .on("mousemove", function (d) {
              d3.select(this).attr("fill", "#666666");
              tooltip.style("left", d3.event.pageX - 50 + "px")
                  .style("top", d3.event.pageY - 120 + "px")
                  .style("display", "inline-block")
                  .html("<div><b>" +"Title" + "</b> : " + (d.title) + "</div> " + "<div><b>" +"Main Speaker" + "</b> : " + (d.main_speaker)+ "</div> " +"<div><b>" + "Speaker's Occupation" + "</b> : " + (d.speaker_occupation) + "</div> ");
      })
      .on("mouseout", function (d) {
            d3.select(this).attr("fill", function(d) { return color(d.views)});
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
     .text(xrating); /////replace x here

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
        .text(yrating); /////replace y here


}
