queue()
    .defer(d3.json, "/cryptoBEL/projects")
    .await(makeGraphs);

function makeGraphs(error, cryptoBELprojects) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }
    function print_filter(filter) {
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
    }

cryptoBELprojects.forEach(function (d) {
    var tempDate= new Date(d['date_posted']);
    d['date_posted'] = tempDate;
    d['price'] = +d['price'];
    d['market_cap'] = +d['market_cap'];
    d['circulating_supply'] = +d['circulating_supply'];
});
//-------------------------------------------------------------------------------

    var facts = crossfilter(cryptoBELprojects);

    var all = facts.groupAll();

    var sumTotal = all.reduceSum(function (d) {
        return d['market_cap'];
    }).value();

    //console.log(sumTotal);
//----------------------------------------------------------------------------
    var typeDimension = facts.dimension(function (d){
         return d['name'];
    });

    var typeGroup = typeDimension.group().reduceSum(function(d){
        return d['circulating_supply'];
    });
//---------------------------------------------------------------
    var marketDimension = facts.dimension(function(d){
       return d['name'];
    });

    var marketGroup = marketDimension.group().reduceSum(function(d){
        return d['market_cap'];
    });
//----------------------------------------------------------------

    var dateDimension = facts.dimension(function (d) {
    return d["date_posted"];
    });

    var dateGroup = dateDimension.group().reduceSum(function(d){
        return d['price'];
    });

    var dateGroupName = dateDimension.group().reduceSum(function (d){
        return d['market_cap'];
    });
//---------------------------------------------------------------

//-------------------------------------------------------------------
// boxplot
  //  var experimentDimension = facts.dimension(function(d){ return d['name']});
  //  var priceArrayGroup = experimentDimension.group().reduce(
  //    function (i,d) { i.push(d['price']); return i;},
  //    function (i,d) { i.splice(i.indexOf(d['price']), 1); return i;},
   //   function(){return[];}
   // );

    //series chart

    var priceDimension = facts.dimension(function (d) {
       return [d.name, d.date_posted];
    });

    var priceGroup = priceDimension.group().reduceSum(function (d) {
        return d.market_cap;
    });

//-------------------------------------------------------------------
    var minDate = dateDimension.bottom(1)[0].date_posted;
    var maxDate = dateDimension.top(1)[0].date_posted;
//----------------------------------------------------
    //BarChart
//-------------------------------------------------
   var barChart = dc.barChart("#bar-chart")
        .height(400)
        .dimension(typeDimension)
        .group(typeGroup)
        .yAxisLabel('')
        .margins({top: 10, right: 10, bottom: 20, left: 90})
        .x(d3.scale.ordinal().domain(['Bitcoin', 'Ethereum', 'Litecoin']))
        .transitionDuration(2600)
        .xUnits(dc.units.ordinal)
        .yAxis().ticks(10);

//----------------------------------------------------
    //Timechart
//-------------------------------------------------

  var lineChart = dc.lineChart("#time-chart")
        .width(1300)
        .height(200)
        .margins({top: 10, right: 200, bottom: 20, left: 120})
        .dimension(dateDimension)
        .group(dateGroup)
       // .stack(dateGroupName)
        .elasticY(true)
        .yAxisLabel('Price')
        .renderHorizontalGridLines(true)
        .renderArea(true)
        .x(d3.time.scale().domain([minDate, maxDate]));


        lineChart.yAxis().ticks(5);
        lineChart.xAxis().ticks(4);
//-----------------------------------------------------------

    //Pie Chart
//------------------------------------------------------------

  var pieChart = dc.pieChart("#pie-chart")
        .height(200)
        .title(function (d) {
          console.log(d.key); return d.key + ': $'+d.value
      })
      .ordinalColors(["#f89e32","#2e2f2f","#a6e1ec"])
      .transitionDuration(1500)
      .label(function (d) {
        return Math.round((d.value/sumTotal)*100)+'%';
     })
        .dimension(marketDimension)
        .group(marketGroup)
        .transitionDuration(1900)
        .legend(dc.legend().x(450).y(5).itemHeight(12).gap(5));

//----------------------------------------------------------------------
    var dataTable = dc.dataTable("#table")

        .dimension(dateDimension)
        .size(10)
        .group(function (d) {
           console.log(d); return d.name;
        })
        .columns(['date_posted',
            'name',
            'price',
            'market_cap', 'circulating_supply'])
        .on("renderlet", function (table) {
            table.selectAll('.dc-table-group').classed('info',true);
        });
//-----------------------------------------------------------
    var series = dc.seriesChart("#series-chart")
        .width(1360)
        .height(400)
        .ordinalColors(["#f89e32","#2e2f2f","#a6e1ec"])
        .margins({top:40, bottom: 60, right: 80, left:100})
        .chart(function (cht) {
            return dc.lineChart(cht).renderArea(true).interpolate('basis')
        })

        .dimension(priceDimension)
        .group(priceGroup)
        .elasticY(true)

        .keyAccessor(function (d) {
            return d.key[1];
        })// x axis
        .valueAccessor(function (d) {
            return d.value;
        })
        .seriesAccessor(function (d) {
            return d.key[0];
        })
        .legend(dc.legend().x(1250).y(39).itemHeight(13).gap(4).legendWidth(1360).itemWidth(70))
        .x(d3.time.scale().domain([new Date(2013, 6, 18), new Date(2018, 4, 22)]));


//-------------------------------------Test------------------------------------------------------------------

 //   priceDimension
 //       .formatNumber(d3.format("d"))
 //       .valueAccessor(function (d) {
   //         return d;
     //   })
       // .group(sumTotal)
        //.formatNumber(d3.format(".3s"));





     /// console.log(cryptoBELprojects);
        print_filter('priceGroup ');



    dc.renderAll();
}
