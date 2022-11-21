// window.addEventListener("scroll",function(){
//     document.getElementById("yearpanel").innerHTML = Math.trunc(document.documentElement.scrollTop);
// });

// event listener for CSS scroll animation
window.addEventListener('scroll', () => {
    document.body.style.setProperty('--scroll',window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
  }, false);


//Google Charts implementation
google.charts.load('current', {'packages':['corechart', 'geochart']});

google.charts.setOnLoadCallback(init);

//initiatie popovers
var popoverYear = new mdb.Popover(document.querySelector('#year_panel').parentElement)

function init() {

    var query = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1wBB4VbBn-ULczixgqPvbMcSzHQ9825yYvL78GAOz0mM/gviz/tq?range=A1:BE646', headers=0);
    query.send(handleQueryResponse);

    function handleQueryResponse(response){
      if (response.isError()) {
        alert('Error in query:' + response.getMessage() + "" + response.getDetailedMessage());
        return;
      }
      var ageData=response.getDataTable();

      var ageView = new google.visualization.DataView(ageData);
      ageView.setColumns([1,4])

      // get the average age and count... (MAYBE JUST HARDCODE THIS LOL?)

      function calcAvgCount(){
        var groupAgeData = google.visualization.data.group(
          ageView,
          // group across entire table -- use modifier to return same value for every row
          [{column: 0, modifier: function () {return '';}, type: 'string'}],
          [ // aggregation functions
            {column: 1, aggregation: google.visualization.data.sum, type: 'number', label: 'Average'},
            {column: 1, aggregation: countNoNull, type: 'number', label: 'Count No Null'},
          ]
        );
  
        function countNoNull(values) {
          var countValue = 0;
          values.forEach(function (appearances) {
            if (appearances != null) {
              countValue = (countValue+1);
            }
          });
          return countValue;
        }
      return groupAgeData;
      }
      


      var optionsHistogram = {
        backgroundColor: 'transparent',
        width: "100%",
        height: "100%",
        title: 'Age of Nuclear Reactors [Worldwide]',
        titleTextStyle: {fontName: "Poppins", fontSize: 18},
        // axisTitlesPosition: 'none',
        // theme: "maximized",
        legend: { position: "in", alignment: "end"},
        focusTarget: 'datum',
        vAxis: {maxValue: 300, title: "Number of Reactors", gridlines: {color:'#cccccc'}, minorGridlines: {color: '#cccccc'}},
        hAxis: {maxValue: 60, title: "Age in Years", gridlines: {color:'#cccccc'}},
        histogram: { 
          bucketSize: 10,
          maxValue: 50,
        },
        animation:{
          duration: 100,
          easing: 'out',
          startup: true,
        }};



      var yeardata = [1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]

      // Create and draw the visualizatio n.
      var current = 0;
      var displayedcurrent;
      var chart = new google.visualization.Histogram(document.getElementById('visualization'));
      chart.draw(ageView, optionsHistogram);


      // add listenter to see if the displayed year is different than window position on scroll
      window.addEventListener('scroll', () => {
        current = Math.trunc(document.documentElement.scrollTop / 150);

        if (displayedcurrent !== current) {
          displayedcurrent = drawChart(displayedcurrent, current);
        }

        // make year planel pop-out once reached end
        if (displayedcurrent == 52) {
          document.querySelector("#year_panel").classList.add("year-panel");
          popoverYear.show();

        } else{
          popoverYear.hide()
        }

      }, false);
    
      function drawChart(displayedcurrent, current) {

          if (current<yeardata.length && displayedcurrent !== current) {
            var displayedcurrent = current;
            ageView.setColumns([1,current+4]);
            groupData = calcAvgCount();
            document.querySelector("#year_panel").innerHTML = yeardata[current];
            document.querySelector("#age_panel").innerHTML = (groupData.getValue(0,1)/groupData.getValue(0,2)).toFixed(1);
            document.querySelector("#number_reactors_panel").innerHTML = groupData.getValue(0,2);
            chart.draw(ageView, optionsHistogram);
            console.log(current);
          }

          return displayedcurrent;

      }

      drawChart(displayedcurrent, current);


      // Make larger detailed histogram
      var optionsHistogramLarge = {
        backgroundColor: 'transparent',
        width: "100%",
        height: 500,
        // title: 'Age of Nuclear Reactors [Worldwide]',
        // titleTextStyle: {fontName: "Poppins", fontSize: 18},
        // axisTitlesPosition: 'none',
        // colors: ['green','red','yellow','black'],
        // theme: "maximized",
        // legend: { position: "in", alignment: "start"},
        focusTarget: 'datum',
        hAxis: {title: "Age", textStyle: {fontSize: 15}},
        vAxis: {title: "Number of Reactors", gridlines: {colour:'#000000'}, minorGridlines: {color: '#000000'},textStyle: {fontSize: 15}},
        legend: {position: 'out', alignment: "start", textStyle: {fontSize: 15}},
        chartArea:{left:'8%', top:'2%',width:'90%',height:'88%'},
        animation:{
          duration: 2000,
          easing: 'out',
          startup: true,
        }
      };
      
      var ageChartLarge = new google.visualization.Histogram(document.getElementById('large_histogram'));
      // ageChartLarge.draw(ageView, optionsHistogramLarge);
  
      document.querySelector("#yearSlider").addEventListener('click', redrawLargeHistogram);
      document.querySelector("#yearSlider").addEventListener('touchend', redrawLargeHistogram);
      
      function redrawLargeHistogram() {
        let selectedYear = document.getElementById('yearSelection').outerText
        document.querySelector("#ageModalYear").innerHTML = selectedYear;
        ageView.setColumns([1,selectedYear-1970+4]);
        ageChartLarge.draw(ageView, optionsHistogramLarge);
      };

      document.querySelector("#ageChartModal").addEventListener('shown.bs.modal', () => {
        document.querySelector("#ageModalYear").innerHTML = yeardata[displayedcurrent];
        ageView.setColumns([1,displayedcurrent+4]);
        ageChartLarge.draw(ageView, optionsHistogramLarge);
      }, false);
      

      drawFLRChart();

    }



    // var rowData1970 = [['Bin', 'Number of Reactors'],
    //     ['0-10', 74],
    //     ['10-20', 16],
    //     ['20-30', 0],
    //     ['30-40', 0],
    //     ['40-50', 0],
    //     ['50-60', 0]];
    // var rowData1980 = [['Bin', 'Number of Reactors'],
    //     ['0-10', 174],
    //     ['10-20', 62],
    //     ['20-30',13],
    //     ['30-40', 0],
    //     ['40-50', 0],
    //     ['50-60', 0]];
    // var rowData1990 = [['Bin', 'Number of Reactors'],
    //     ['0-10', 207],
    //     ['10-20', 165],
    //     ['20-30', 38],
    //     ['30-40', 10],
    //     ['40-50', 0],
    //     ['50-60', 0]];
    // var rowData2000 = [['Bin', 'Number of Reactors'],
    //     ['0-10', 52],
    //     ['10-20', 204],
    //     ['20-30', 153],
    //     ['30-40', 27],
    //     ['40-50', 9],
    //     ['50-60', 0]];
    // var rowData2010 = [['Bin', 'Number of Reactors'],
    //     ['0-10', 34],
    //     ['10-20', 52],
    //     ['20-30', 201],
    //     ['30-40', 140],
    //     ['40-50', 19],
    //     ['50-60', 0]];
    // var rowData2020 = [['Bin', 'Number of Reactors'],
    //     ['0-10', 62],
    //     ['10-20', 34],
    //     ['20-30', 51],
    //     ['30-40', 187],
    //     ['40-50', 99],
    //     ['50-60', 10]];

    // Create and populate the data tables.
    // var data = [];
    //     data[0] = google.visualization.arrayToDataTable(rowData1970);
    //     data[1] = google.visualization.arrayToDataTable(rowData1980);
    //     data[2] = google.visualization.arrayToDataTable(rowData1990);
    //     data[3] = google.visualization.arrayToDataTable(rowData2000);
    //     data[4] = google.visualization.arrayToDataTable(rowData2010);
    //     data[5] = google.visualization.arrayToDataTable(rowData2020);

    // var options = {
    //     backgroundColor: 'transparent',
    //     width: "100%",
    //     height: 400,
    //     title: 'Age of Nuclear Reactors [Worldwide]',
    //     titleTextStyle: {fontName: "Poppins", fontSize: 18},
    //     legend: { position: "none" },
    //     vAxis: {maxValue: 300, title: "Number of Reactors"},
    //     seriesType: "bars",
    //     animation:{
    //     duration: 200,
    //     easing: 'out',
    //     },
    // };
    // // Create and draw the visualizatio n.
    // var current = 0;
    // var displayedcurrent;
    // var chart = new google.visualization.ComboChart(document.getElementById('visualization2'));
    // var button = document.getElementById('b1');



    // // add listenter to see if the displayed year is different than window position on scroll
    // window.addEventListener('scroll', () => {

    //   current = Math.trunc(document.documentElement.scrollTop / 800);

    //   if (displayedcurrent !== current) {
    //     displayedcurrent = drawChart(displayedcurrent, current);
    //   }
    // }, false);
  
    // function drawChart(displayedcurrent, current) {

    //     if (current<data.length && displayedcurrent !== current) {
    //       document.querySelector("#yearpanel").innerHTML = yeardata[current];
    //       var displayedcurrent = current;
    //       chart.draw(data[current], options);
    //       console.log(current);
    //     }

    //     return displayedcurrent;

    // }

    // drawChart(displayedcurrent, current);

    // drawFLRChart();

}


// Draw the FLR scatter chart
function drawFLRChart(){
  var dataFLR = new google.visualization.DataTable();
  dataFLR.addColumn('number', 'Plant Age');
  dataFLR.addColumn('number', 'Yearly Forced Loss Rate');
  dataFLR.addColumn({type:'boolean', role:'scope'});
  dataFLR.addColumn('number', 'FLR Trend');
  dataFLR.addColumn('number', 'Yearly Forced Loss Rate (PHWR)');
  dataFLR.addColumn('number', 'Yearly Forced Loss Rate (PWR)');
  dataFLR.addColumn('number', 'Yearly Forced Loss Rate (BWR)');
  dataFLR.addColumn('number', 'Yearly Unit Capability Factor');
  dataFLR.addColumn('number', 'UCF Trend');
  dataFLR.addColumn('number', 'Yearly Unit Capability Factor (PHWR)');
  dataFLR.addColumn('number', 'Yearly Unit Capability Factor (PWR)');
  dataFLR.addColumn('number', 'Yearly Unit Capability Factor (BWR)');


  // age, flr, scope, flr avg, PHWR, BWR, PWR, ucf, ucfAvg, ucfPHWR, ucfBWR, ucfPWR
  dataFLR.addRows([
    [0, 2.007, false, null, null, null, 2.01, 96.74, 86.75,  null,  null,	96.74],
    [1, 7.645365854, false, null, 24.38, 0.00, 5.40, 88.75, 86.52, 74.91, 100.0,	90.57],
    [2, 5.667021277, false, null, 9.54, 14.71, 4.54, 81.18, 86.29,	86.86,	85.29,	79.97],
    [3, 4.866, false, null, 5.82, 41.44, 2.69, 83.24, 86.06,	85.03,	44.84,	84.88],
    [4, 3.072473118, false, null, 4.62, 4.12, 2.69, 86.11, 85.83,	89.63,	67.31,	86.56],
    [5, 2.838695652, true, 2.6144, 4.95, 4.46, 2.16, 84.37, 85.60,	87.83,	72.25,	84.72],
    [6, 3.785, true, 2.6434, 6.75, 18.06, 1.72, 87.42, 85.37,	89.32,	72.00,	88.60],
    [7, 2.710697674, true, 2.6724, 6.58, 6.44, 0.97, 84.07, 85.14,	85.42,	56.22,	87.54],
    [8, 2.79902439, true, 2.7014, 4.40, 3.44, 1.63, 85.49, 84.91,	91.64,	69.89,	86.44],
    [9, 1.98720930, true, 2.7304, 2.80, 0.81, 1.93, 86.21, 84.68,	90.40,	68.55,	87.91],
    [10, 1.995909091, true, 2.7594, 3.57, 0.52, 1.68, 85.65, 84.45,	91.47,	67.46,	86.67],
    [11, 2.021573034, true, 2.7884, 2.60, 0.20, 2.18, 83.02, 84.22,	90.03,	52.18,	85.79],
    [12, 2.73106383, true, 2.8174, 3.12, 3.10, 2.51, 83.35, 83.99,	89.92,	59.96,	86.10],
    [13, 2.350196078, true, 2.8464, 1.94, 3.16, 2.00, 82.57, 83.76,	89.89,	59.36,	85.14],
    [14, 2.667235772, true, 2.8754, 2.48, 1.71, 1.98, 82.27, 83.53,	90.84,	59.78,	84.58],
    [15, 2.435874126, true, 2.9044, 2.37, 2.00, 2.08, 84.20, 83.29,	90.44,	64.74,	87.11],
    [16, 2.684191617, true, 2.9334, 2.54, 2.81, 2.28, 83.02, 83.06,	87.71,	64.45,	85.52],
    [17, 2.834009901, true, 2.9624, 1.90, 5.28, 2.00, 81.72, 82.83,	76.22,	67.24,	86.23],
    [18, 2.762237443, true, 2.9914, 3.36, 4.43, 2.10, 82.15, 82.60,	77.26,	71.87,	86.19],
    [19, 3.131120332, true, 3.0204, 4.42, 3.70, 2.14, 80.60, 82.37,	82.39,	69.62,	83.45],
    [20, 3.335059761, true, 3.0494, 4.83, 3.33, 2.61, 81.35, 82.14,	83.99,	70.46,	83.83],
    [21, 3.879219331, true, 3.0784, 5.91, 2.11, 3.21, 80.58, 81.91,	82.57,	72.33,	83.15],
    [22, 3.720683453, true, 3.1074, 7.70, 2.99, 2.69, 80.88, 81.68,	81.68,	78.95,	82.47],
    [23, 3.331731449, true, 3.1364, 3.13, 1.34, 3.11, 79.42, 81.45,	78.21,	77.30,	81.45],
    [24, 3.700912162, true, 3.1654, 8.94, 2.80, 2.35, 80.96, 81.22,	78.63,	77.82,	83.65],
    [25, 3.841140065, true, 3.1944, 5.04, 5.21, 2.86, 80.21, 80.99,	84.07,	73.69,	83.01],
    [26, 3.325527157, true, 3.2234, 4.55, 4.37, 2.09, 81.34, 80.76,	80.34,	74.62,	84.91],
    [27, 3.299237805, true, 3.2524, 5.36, 3.97, 2.39, 81.11, 80.53,	73.84,	79.19,	83.17],
    [28, 2.782100592, true, 3.2814, 5.71, 3.13, 1.86, 81.25, 80.30,	68.63,	77.80,	84.59],
    [29, 3.414473684, true, 3.3104, 7.01, 3.38, 2.56, 80.32, 80.07,	66.22,	78.88,	83.78],
    [30, 3.184633431, true, 3.3394, 5.13, 2.98, 2.11, 79.02, 79.84,	71.30,	76.60,	81.45],
    [31, 3.254726225, true, 3.3684, 5.28, 1.97, 2.70, 78.11, 79.61,	76.13,	76.81,	79.82],
    [32, 3.760202899, true, 3.3974, 3.79, 3.42, 2.90, 77.99, 79.38,	80.76,	77.15,	78.96],
    [33, 3.493283582, true, 3.4264, 8.73, 3.67, 2.69, 79.67, 79.15,	81.09,	77.89,	80.36],
    [34, 3.915975232, true, 3.4554, 4.33, 3.92, 3.35, 78.72, 78.92,	76.71,	74.73,	80.75],
    [35, 3.683232323, true, 3.4844, 5.59, 4.43, 3.06, 79.39, 78.68,	69.08,	81.22,	80.52],
    [36, 2.861151079, true, 3.5134, 7.86, 2.57, 1.95, 78.55, 78.45,	67.18,	81.67,	79.75],
    [37, 3.321755102, true, 3.5424, 9.17, 0.98, 2.80, 79.08, 78.22,	64.33,	84.51,	79.40],
    [38, 4.158720379, true, 3.5714, 10.19, 3.61, 2.80, 77.21, 77.99,	69.39,	81.98,	78.11],
    [39, 4.028351064, true, 3.6004, 11.86, 2.77, 2.94, 78.24, 77.76,	71.25,	84.94,	77.30],
    [40, 3.630365854, true, 3.6294, 11.65, 2.21, 2.25, 76.43, 77.53,	66.34,	81.21,	78.81],
    [41, 3.805625, true, 3.6584, 5.98, 2.40, 3.53, 79.63, 77.30,	85.06,	83.05,	78.24],
    [42, 3.905916667, true, 3.6874, 7.47, 4.58, 2.98, 76.30, 77.07,	69.13,	79.02,	76.57],
    [43, 4.592596154, true, 3.7164, 9.97, 7.38, 1.90, 76.55, 76.84,	79.45,	79.77,	76.39],
    [44, 2.644347826, true, 3.7454, 8.44, 1.05, 1.97, 77.91, 76.61,	72.82,	84.12,	79.00],
    [45, 2.375853659, true, 3.7744, 5.37, 2.62, 0.71, 79.72, 76.38,	76.38,	85.71,	82.34],
  ])    
  
  var FLRView = new google.visualization.DataView(dataFLR);
  FLRView.setColumns([0,1])

    var FLRoptions={
      backgroundColor: 'transparent',
      width: "20%",
      height: 500,
      theme: "maximized",
      legend: { position: "none" },
      vAxis: {viewWindow:{min: 0}, maxValue: 8, gridlines: {color:'#8b8b8b'}, minorGridlines: {color: '#cccccc'}},
      hAxis: {viewWindow:{max: 50}, gridlines: {color:'#8b8b8b'}},
      seriesType: "scatter",
      series: {1: {type: "line", lineDashStyle: [10, 2]}, 6: {type: "line", lineDashStyle: [10, 2]}},
      animation:{
      duration: 1300,
      easing: 'linear',
    }
  }

  var FLRchart = new google.visualization.ComboChart(document.querySelector('#FLRvisualilzation'));

  FLRchart.draw(FLRView, FLRoptions)


  window.addEventListener('scroll', () => {

    const CW2 = document.querySelector(".contentwrapper2");
    const pixelsfromCW2 = CW2.getBoundingClientRect().top;
    const heightCW2 = CW2.getBoundingClientRect().height;

      console.log(pixelsfromCW2/heightCW2);

    if (pixelsfromCW2 < -1600){
      FLRView.setColumns([0,7,8]);
      FLRoptions.vAxis.viewWindow.min = 50;
      FLRchart.draw(FLRView, FLRoptions);
      document.querySelector('#flrGraphTitle').innerHTML = "Yearly Unit Capability Factor vs Plant Age (2001 - 2021)";
      document.querySelector('#FLR-yaxis').innerHTML = "Yearly UCF";
      document.querySelector('#rbAll').checked = true;
      document.querySelector('#rbAll2').checked = true;
      document.querySelector(".BreakInOverlay").style.display = "none"; 
      document.querySelector(".TrendOverlay").style.display = "none";  
    }
    else if(pixelsfromCW2 < -1000){
    }
    else if (pixelsfromCW2 < -800){
      FLRView.setColumns([0,1,2,3]);
      FLRoptions.vAxis.viewWindow.min = 0;
      FLRchart.draw(FLRView, FLRoptions); 
      document.querySelector('#rbAll').checked = true;
      document.querySelector('#rbAll2').checked = true;
      document.querySelector("#point2").classList.add("animate-point");
      document.querySelector("#arrow2").classList.add("animate-arrow");
      document.querySelector(".TrendOverlay").style.opacity = "100%";
      document.querySelector('#flrGraphTitle').innerHTML = "Yearly Forced Loss Rate vs Plant Age (2001 - 2021)"
      document.querySelector('#FLR-yaxis').innerHTML = "Yearly FLR";
    }
    else if (pixelsfromCW2 < -200) {
      FLRView.setColumns([0,1,2,3]);
      FLRoptions.vAxis.viewWindow.min = 0;
      FLRchart.draw(FLRView, FLRoptions); 
      document.querySelector('#rbAll').checked = true;
      document.querySelector('#rbAll2').checked = true;
      document.querySelector("#point").classList.add("animate-point");
      document.querySelector("#arrow").classList.add("animate-arrow");
      document.querySelector(".BreakInOverlay").style.opacity = "100%";
      document.querySelector('#flrGraphTitle').innerHTML = "Yearly Forced Loss Rate vs Plant Age (2001 - 2021)"
      document.querySelector('#FLR-yaxis').innerHTML = "Yearly FLR";
      }
  }, false);

  var flrPlantTypeGroups = document.querySelectorAll(".flr-plant-type");

  flrPlantTypeGroups.forEach(function(item) {
    item.addEventListener('click', function(e) {
    var flrPlantTypeRadios = item.querySelectorAll('input');
    for (let i = 0; i < flrPlantTypeRadios.length; i++) {
      if (flrPlantTypeRadios[i].checked == true) {
        FLRoptions.vAxis.viewWindow.min = 0;
        document.querySelector('#flrGraphTitle').innerHTML = "Yearly Forced Loss Rate vs Plant Age (2001 - 2021)"
        document.querySelector('#FLR-yaxis').innerHTML = "Yearly FLR";
        document.querySelector("#point").style.opacity = "0%";
        document.querySelector("#arrow").style.opacity = "0%";
        document.querySelector(".BreakInOverlay").style.display = "none";  
        document.querySelector("#point2").style.opacity = "0%";
        document.querySelector("#arrow2").style.opacity = "0%";
        document.querySelector(".TrendOverlay").style.display = "none";  
        if (flrPlantTypeRadios[i].id == 'rbAll' || flrPlantTypeRadios[i].id == 'rbAll2') {
          FLRView.setColumns([0,1,2,3]);
          FLRchart.draw(FLRView, FLRoptions);
        } else if (flrPlantTypeRadios[i].id == 'rbPHWR' || flrPlantTypeRadios[i].id == 'rbPHWR2') {
          FLRView.setColumns([0,4]);
          FLRchart.draw(FLRView, FLRoptions); 
        } else if (flrPlantTypeRadios[i].id == 'rbBWR' || flrPlantTypeRadios[i].id == 'rbBWR2') {
          FLRView.setColumns([0,5]);
          FLRchart.draw(FLRView, FLRoptions); 
        } else if (flrPlantTypeRadios[i].id == 'rbPWR' || flrPlantTypeRadios[i].id == 'rbPWR2') {
          FLRView.setColumns([0,6]);
          FLRchart.draw(FLRView, FLRoptions); 
        }
      } ;
    }

  })
})


}


// sticky the cards at the top of the page
var intersectoptions = {
  rootMargin: '20px',
  threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
} 

var observer = new IntersectionObserver(callback, intersectoptions)

var target = document.querySelector("#card1");
observer.observe(target);

function callback(entries,observer){
  entries.forEach((entry) => {
   entry.target.style.opacity = entry.intersectionRatio;
   if (entry.intersectionRatio > 0.5) {
    // document.querySelector("#section1").classList.add("sticky-top") 
    document.querySelector("#section1").classList.add("sticky-top") 
    // document.querySelector("#section1").style.left = "50%" 
    // document.querySelector("#section1").style.top = "50%" 
    // document.querySelector("#section1").style.transform = "translate(-50%, -50%)" 

    // document.querySelector("#section2").style.position = "fixed" 
  }
  });
}



// DRAW THE GEOCHART FOR UNDERCONTRUCTION AND PLANNED
// document.querySelector("#gif-card-map").onresize = drawGeoChart


window.addEventListener('click', function(e) {

  console.log(e.target);

    if (e.target && e.target.closest('.visualizationCard')) {
      console.log(e.target.closest('.visualizationCard'));
      return;
    } else if (document.activeElement === document.querySelector("#cardgif2")) {
      var queryConstuctPlanned = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1wBB4VbBn-ULczixgqPvbMcSzHQ9825yYvL78GAOz0mM/gviz/tq?range=A1:T118', headers=2, gid=1476615709);
        queryConstuctPlanned.send(ConstuctPlannedResponse);
      }
    

  
  function ConstuctPlannedResponse(response){
    if (response.isError()) {
      alert('Error in query:' + response.getMessage() + "" + response.getDetailedMessage());
      return;
    } 
  
    var dataConstructPlanned = new google.visualization.DataTable();
    
    dataConstructPlanned.addColumn('number', 'Lat');
    dataConstructPlanned.addColumn('number', 'Lon');
    dataConstructPlanned.addColumn('string', 'Name'); 
    dataConstructPlanned.addColumn('number', 'Value'); 
    dataConstructPlanned.addColumn({type:'string', role:'tooltip', 'p': {'html': true}});
  
  
    dataConstructPlanned.addRows([
  
  [36.3376245,	33.3929192, "AKKUYU", 4456,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1920px-Flag_of_Turkey.svg.png", "AKKUYU", "Construction", "VVER V-509", 4456)],
  [-23.0473481,	-44.4259392, "ANGRA-3", 1340,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/1920px-Flag_of_Brazil.svg.png", "ANGRA-3", "Construction", "PRE KONVOI", 1340)],
  [55.0822694,	21.8823018, "BALTIC-1", 1109,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "BALTIC-1", "Construction", "VVER V-491", 1109)],
  [55.0822694,	21.8823018, "BALTIC-2", 1109,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "BALTIC-2", "Planned", "VVER V-491", 1109)],
  [31.3286757,	118.3239541, "BAMAOSHAN", 900,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "BAMAOSHAN", "Planned", "CPR-1000", 900)],
  [23.9696174,	52.2337279, "BARAKAH 3&4", 2690,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Flag_of_the_United_Arab_Emirates.svg/1920px-Flag_of_the_United_Arab_Emirates.svg.png", "BARAKAH 3&4", "Construction", "Apr-1400", 2690)],
  [54.0345875,	54.3302038, "BASHKIR 1&2", 2230,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "BASHKIR 1&2", "Planned", "VVER V-510", 2230)],
  [54.6141155,	25.9534889, "BELARUSIAN-2", 1110,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Flag_of_Belarus_%282004_World_Factbook%29.svg/1920px-Flag_of_Belarus_%282004_World_Factbook%29.svg.png", "BELARUSIAN-2", "Construction", "VVER V-491", 1110)],
  [56.82233,	61.1335721, "BELOYARSK-5", 0,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "BELOYARSK-5", "Planned", "BN-1200", 0)],
  [56.6555731,	84.7730364, "BREST-OD-300", 300,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "BREST-OD-300", "Construction", "BREST-OD-300", 300)],
  [28.829784,	50.8837742, "BUSHEHR-2", 974,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/1920px-Flag_of_Iran.svg.png", "BUSHEHR-2", "Construction", "V-528 VVER-1000 AES-92 GIII+", 974)],
  [28.829784,	50.8837742, "BUSHEHR-3", 974,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/1920px-Flag_of_Iran.svg.png", "BUSHEHR-3", "Planned", "VVER V-528", 974)],
  [-34.0952702,	-59.0268947, "CAREM25", 25,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1920px-Flag_of_Argentina.svg.png", "CAREM25", "Construction", "CAREM Prototype (Integrated-PWR)", 25)],
  [58.631061,	41.3020292, "CENTRAL", 2230,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "CENTRAL", "Planned", "VVER V-510", 2230)],
  [19.2139206,	108.8090699, "CHANGJIANG 3&4", 2000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "CHANGJIANG 3&4", "Construction", "HPR1000", 2000)],
  [30.7461388,	48.4207808, "DARKHOVAIN", 330,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/1920px-Flag_of_Iran.svg.png", "DARKHOVAIN", "Planned", "IR-360", 330)],
  [21.6369545,	108.3213326, "FANGCHENGGANG 3&4", 2000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "FANGCHENGGANG 3&4", "Construction", "HPR1000", 2000)],
  [21.6369545,	108.3213326, "FANGCHENGGANG 5&6", 2000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "FANGCHENGGANG 5&6", "Planned", "Unknown", 2000)],
  [49.5338071,	-1.884829, "FLAMANVILLE-3", 1630,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_France_%281794%E2%80%931815%2C_1830%E2%80%931974%2C_2020%E2%80%93present%29.svg/1920px-Flag_of_France_%281794%E2%80%931815%2C_1830%E2%80%931974%2C_2020%E2%80%93present%29.svg.png", "FLAMANVILLE-3", "Under Construction", "EPR", 1630)],
  [29.446726,	75.6679702, "GORAKHPUR", 1260,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Flag_India.svg/1920px-Flag_India.svg.png", "GORAKHPUR", "Planned", "PHWR-700", 1260)],
  [36.867682,	121.0243755, "HAIYANG-3", 1161,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "HAIYANG-3", "Construction", "CAP1000", 1161)],
  [36.867682,	121.0243755, "HAIYANG-4", 1161,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "HAIYANG-4", "Planned", "AP-1000", 1161)],
  [34.6232698,	138.1403323, "HAMAOKA-6", 1350,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "HAMAOKA-6", "Planned", "ABWR", 1350)],
  [64.4650616,	24.2537386, "HANHIKIVI-1", 1200,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Finland.svg/1920px-Flag_of_Finland.svg.png", "HANHIKIVI-1", "Planned", "VVER V-522", 1200)],
  [41.4303829,	141.4599428, "HIGASHI DORI", 3886,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "HIGASHI DORI", "Planned", "ABWR", 3886)],
  [51.2075454,	-3.1298964, "HINKLEY POINT C", 3260,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/1920px-Flag_of_the_United_Kingdom.svg.png", "HINKLEY POINT C", "Construction", "EPR-1750", 3260)],
  [37.4821512,	122.0122706, "HONGSHIDING", 0,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "HONGSHIDING", "Planned", "ACPR1000", 0)],
  [30.6590615,	117.4716942, "JIYANG", 4000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "JIYANG", "Planned", "Unknown", 4000)],
  [14.8661177,	74.4361341, "KAIGA 5&6", 1260,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Flag_India.svg/1920px-Flag_India.svg.png", "KAIGA 5&6", "Planned", "Unknown", 1260)],
  [21.1918032,	72.8653722, "KAKRAPAR-4", 630,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Flag_India.svg/1920px-Flag_India.svg.png", "KAKRAPAR-4", "Construction", "PHWR-700", 630)],
  [33.7968835,	132.0331628, "KAMINOSEKI", 2650,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "KAMINOSEKI", "Planned", "ABWR", 2650)],
  [50.325503,	26.586325, "KHMELNITSKI 3&4", 2070,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/1920px-Flag_of_Ukraine.svg.png", "KHMELNITSKI 3&4", "Construction", "VVER", 2070)],
  [67.3731116,	32.4794005, "KOLA 2", 2200,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "KOLA 2", "Planned", "Unknown", 2200)],
  [8.1819681,	77.696793, "KUDANKULAM 3,4,5,6", 3668,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Flag_India.svg/1920px-Flag_India.svg.png", "KUDANKULAM 3,4,5,6", "Construction", "VVERV412", 3668)],
  [51.635925,	35.654298, "KURSK 2 1&2", 2350,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "KURSK 2 1&2", "Construction", "VVER V-510K", 2350)],
  [51.635925,	35.654298, "KURSK 2 3&4", 2230,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "KURSK 2 3&4", "Planned", "VVER V-510K", 2230)],
  [59.870502,	29.048342, "LENINGRAD 2 3&4", 2170,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "LENINGRAD 2 3&4", "Planned", "VVER V-491", 2170)],
  [19.2139206,	108.8090699, "LINGLONG-1", 100,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "LINGLONG-1", "Construction", "ACP100", 100)],
  [21.8162875,	115.7017476, "LUFENG 1&2", 2000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "LUFENG 1&2", "Planned", "CPR-1000", 2000)],
  [48.257284,	18.4553143, "MOCHOVCE 3&4", 880,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Flag_of_Slovakia.svg/1920px-Flag_of_Slovakia.svg.png", "MOCHOVCE 3&4", "Construction", "VVER V-213", 880)],
  [41.4884939,	140.8896758, "OHMA", 1328,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "OHMA", "Construction", "ABWR", 1328)],
  [46.6132702,	18.8399315, "PAKS 5&6", 2370,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Civil_Ensign_of_Hungary.svg/1920px-Civil_Ensign_of_Hungary.svg.png", "PAKS 5&6", "Planned", "VVER V-527", 2370)],
  [29.9851678,	116.6484738, "PENGZE", 5000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "PENGZE", "Planned", "Unknown", 5000)],
  [12.5228669,	80.1520737, "PFBR", 470,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Flag_India.svg/1920px-Flag_India.svg.png", "PFBR", "Construction", "Prototype", 470)],
  [25.1484263,	75.8359226, "RAJASTHAN 7&8", 1260,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Flag_India.svg/1920px-Flag_India.svg.png", "RAJASTHAN 7&8", "Construction", "Horizontal Pressure Tube type", 1260)],
  [24.125347,	89.053223, "ROOPPUR", 2160,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Flag_of_Bangladesh.svg/1920px-Flag_of_Bangladesh.svg.png", "ROOPPUR", "Construction", "VVER V-523", 2160)],
  [27.1711184,	120.4620038, "SANAOCUN", 2234,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "SANAOCUN", "Construction", "HRP1000", 2234)],
  [29.0198521,	121.4367652, "SANMEN-3", 1163,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "SANMEN-3", "Construction", "CAP1000", 1163)],
  [29.0198521,	121.4367652, "SANMEN-4", 1157,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "SANMEN-4", "Planned", "AP-1000", 1157)],
  [31.833683,	130.1876338, "SENDAI-3", 1590,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "SENDAI-3", "Planned", "APWR", 1590)],
  [56.6555731,	84.7730364, "SEVERSK", 2230,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "SEVERSK", "Planned", "VVER V-510", 2230)],
  [35.5398612,	132.9841908, "SHIMANE-3", 1325,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "SHIMANE-3", "Construction", "ABWR", 1325)],
  [37.0365475,	129.325683, "SHIN-HANUL-2", 1340,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1920px-Flag_of_South_Korea.svg.png", "SHIN-HANUL-2", "Construction", "Apr-1400", 1340)],
  [35.3649899,	129.2925736, "SHIN-KORI 5&6", 2680,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1920px-Flag_of_South_Korea.svg.png", "SHIN-KORI 5&6", "Construction", "Apr-1400", 2680)],
  [54.1512942,	33.274953, "SMOLENSK 2", 2230,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "SMOLENSK 2", "Planned", "VVER V-510", 2230)],
  [37.1063164,	122.1446306, "SN-1", 1534,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "SN-1", "Planned", "CAP1400", 1534)],
  [37.1063164,	122.1446306, "SN-2", 3068,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "SN-2", "Planned", "CAP1400", 3068)],
  [55.7002534,	60.6790679, "SOUTH URALS", 2230,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1920px-Flag_of_Russia.svg.png", "SOUTH URALS", "Planned", "BN-1200", 2230)],
  [23.0885839,	114.3534264, "TAIPINGLING", 2232,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "TAIPINGLING", "Construction", "HPR1000", 2232)],
  [29.3686544,	112.384646, "TAOHUAJIANG", 0,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "TAOHUAJIANG", "Planned", "Unknown", 0)],
  [34.5965533,	119.060549, "TIANWAN 7&8", 2342,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "TIANWAN 7&8", "Construction", "VVER-1200/V491", 2342)],
  [35.7467706,	136.0194262, "TSURUGA 3&4", 2950,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1920px-Flag_of_Japan.svg.png", "TSURUGA 3&4", "Planned", "APWR", 2950)],
  [33.0949457,	-82.0230952, "VOGTLE 3&4", 2234,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/1920px-Flag_of_the_United_States.svg.png", "VOGTLE 3&4", "Construction", "AP-1000", 2234)],
  [29.8292975,	114.2542062, "XIANNING", 0,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "XIANNING", "Planned", "Unknown", 0)],
  [26.7579372,	119.9984651, "XIAPU-1", 642,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "XIAPU-1", "Construction", "CFR600", 642)],
  [40.5079241,	120.649856, "XUDABU-1", 1000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "XUDABU-1", "Planned", "CPR-1000", 1000)],
  [40.5079241,	120.649856, "XUDABU 2 & 3", 2000,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "XUDABU 2 & 3", "Planned", "CPR-1000", 2000)],
  [40.5079241,	120.649856, "XUDABU 3 & 4", 2400,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "XUDABU 3 & 4", "Construction", "VVER-1200/V491", 2400)],
  [23.8204249,	117.464678, "ZHANGZHOU", 2252,createCustomHTMLContent("https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1920px-Flag_of_the_People%27s_Republic_of_China.svg.png", "ZHANGZHOU", "Construction", "HPR-1000", 2252)]])
  
  

    console.log(document.querySelector(".gif-card-column").clientWidth);
    var optionsConstructPlanned = {
      // region: '005', // South America
      // region: 'US', // North America
      // region: '150', // Europe
      region: '142', // Asia

      // backgroundColor: "#0069b4",
      // backgroundColor: '#81d4fa',
      width: document.querySelector(".gif-card-column").clientWidth,
      height: 430,
      displayMode: 'markers',
      tooltip: { isHtml: true, backgroundColor:'#99ABB8' },
      colorAxis: {colors: ['#e7711c', '#4374e0']},
    }
  
    var chartConstructPlanned = new google.visualization.GeoChart(document.getElementById('visualizationContructPlanned'));

    
    if (e.target.textContent=="Europe") {
      optionsConstructPlanned.region='150';
    } else if (e.target.textContent=="Asia") {
      optionsConstructPlanned.region='142';
    } else if (e.target.textContent=="South America") {
      optionsConstructPlanned.region='005';
    } else if (e.target.textContent=="USA"){
      optionsConstructPlanned.region='US';
    } else {
      optionsConstructPlanned.region=null;
    }
    chartConstructPlanned.draw(dataConstructPlanned, optionsConstructPlanned);
    chartConstructPlanned.draw(dataConstructPlanned, optionsConstructPlanned);
  
  
    function createCustomHTMLContent(flagURL, plantName, plantStatus, reactorType, thermalPower) {
      return '<div style="padding:5px 5px 5px 5px;">' +
          '<img src="' + flagURL + '" style="width:25px;height:15px">' +
          " " + '<b>' + plantName + '</b><br/>' +
          "Status: " + '<b>' + plantStatus + '</b><br/>' +
          "Type: " + '<b>' + reactorType + '</b><br/>' +
          "Power: " + '<b>' + thermalPower + "MW" + '</b><br/>' + '</div>';
    }
  


  };
})



// Draw the chart for nuclear start-ups
document.querySelector('#cardgif3').addEventListener('click', function(e){

    if (e.target && e.target.closest('.visualizationCard')) {
      console.log(e.target.closest('.visualizationCard'));
      return;
    } else if (document.activeElement === document.querySelector("#cardgif3")) {
      var queryStartups = new google.visualization.Query(
        'https://docs.google.com/spreadsheets/d/1wBB4VbBn-ULczixgqPvbMcSzHQ9825yYvL78GAOz0mM/gviz/tq?range=A1:J91', headers=1, gid="602722967");
        queryStartups.send(StartupsResponse);
      }
  
  function StartupsResponse(response){
    if (response.isError()) {
      alert('Error in query:' + response.getMessage() + "" + response.getDetailedMessage());
      return;
    } 
  

    // dataStartups = google.visualization.arrayToDataTable([

    //   ["ID",           'Month', "Round Number","Country", "Funding Raised"],
    //   ["TAE",           202207, 10,"USA", 250000000],
    //   ["TAE",           202104, 9,"USA", 130000000],
    //   ["TAE",           201905, 8,"USA", null],
    //   ["TAE",           201901, 7,"USA", 153500000],
    //   ["TAE",           201809, 6,"USA", 40000000],
    //   ["TAE",           201701, 5,"USA", 128000000],
    //   ["TAE",           201605, 4,"USA", 65000000],
    //   ["TAE",           201501, 3,"USA", 82000000],
    //   ["TAE",           201203, 2,"USA", 127000000],
    //   ["TAE",           201001, 1,"USA", null],
    //   ["Commonwealth",  202112, 4,"USA", 1800000000],
    //   ["Commonwealth",  202005, 3,"USA", 84000000],
    //   ["Commonwealth",  201906, 2,"USA", 115000000],
    //   ["Commonwealth",  201906, 1,"USA", null],
    //   ["TerraPower",    202208, 4,"USA", 750000000],
    //   ["TerraPower",    202203, 3,"USA", 8600000],
    //   ["TerraPower",    200812, 2,"USA", null],
    //   ["TerraPower",    200801, 1,"USA", null],
    //   ["Helion",        202111, 7,"USA", 500000000],
    //   ["Helion",        202001, 6,"USA", 40000000],
    //   ["Helion",        201901, 5,"USA", 10000000],
    //   ["Helion",        201601, 4,"USA", 21300000],
    //   ["Helion",        201510, 3,"USA", 5000000],
    //   ["Helion",        201507, 2,"USA", null],
    //   ["Helion",        201408, 1,"USA", 1500000],
    //   ["NuScale",       202205, 5,"USA", 235000000],
    //   ["NuScale",       202108, 4,"USA", 152000000],
    //   ["NuScale",       202104, 3,"USA", 40000000],
    //   ["NuScale",       201804, 2,"USA", 40000000],
    //   ["NuScale",       200803, 1,"USA", 2600000],
    //   ["General",       202111, 10,"Canada", 120000000],
    //   ["General",       202101, 9,"Canada", null],
    //   ["General",       202007, 8,"Canada", null],
    //   ["General",       201912, 7,"Canada", 65000000],
    //   ["General",       201903, 6,"Canada", null],
    //   ["General",       201810, 5,"Canada", 36000000],
    //   ["General",       201603, 4,"Canada", 13000000],
    //   ["General",       201505, 3,"Canada", 20000000],
    //   ["General",       201402, 2,"Canada", 6500000],
    //   ["General",       201307, 1,"Canada", null],
    //   ["Zap",           202206, 6,"USA", 160000000],
    //   ["Zap",           202105, 5,"USA", 27500000],
    //   ["Zap",           202007, 4,"USA", 6500000],
    //   ["Zap",           202004, 3,"USA", 1000000],
    //   ["Zap",           201912, 2,"USA", 1000000],
    //   ["Zap",           201811, 1,"USA", 6800000],
    //   ["First Light",   202202, 7,"UK", 45000000],
    //   ["First Light",   202106, 6,"UK", null],
    //   ["First Light",   202012, 5,"UK", 25000000],
    //   ["First Light",   201711, 4,"UK", null],
    //   ["First Light",   201508, 3,"UK", 24000000],
    //   ["First Light",   201310, 2,"UK", null],
    //   ["First Light",   201107, 1,"UK", 1000000],
    //   ["Terrestrial",   202111, 9,"Canada", 3000000],
    //   ["Terrestrial",   202105, 8,"Canada", 19000000],
    //   ["Terrestrial",   202007, 7,"Canada", 5000000],
    //   ["Terrestrial",   201903, 6,"Canada", 15000000],
    //   ["Terrestrial",   201709, 5,"Canada", 6000000],
    //   ["Terrestrial",   201609, 4,"Canada", 5000000],
    //   ["Terrestrial",   201603, 3,"Canada", 5000000],
    //   ["Terrestrial",   201601, 2,"Canada", 10000000],
    //   ["Terrestrial",   201512, 1,"Canada", 700000],
    //   ["Seaborg",       202011, 2,"Denmark", 20000000],
    //   ["Seaborg",       201804, 1,"Denmark", 1500000],
    //   ["Avalanche",     202208, 2,"USA", 23000000],
    //   ["Avalanche",     201311, 1,"USA", null],
    //   ["Zeno",          202204, 3,"USA", 20000000],
    //   ["Zeno",          202001, 2,"USA", 1800000],
    //   ["Zeno",          201907, 1,"USA", 120000],
    //   ["USNC",          202001, 1,"USA", 17400000],
    //   ["LeadCold",      202007, 3,"Sweden", 540000],
    //   ["LeadCold",      201610, 2,"Sweden", 18000000],
    //   ["LeadCold",      201512, 1,"Sweden", 137000],
    //   ["X-Energy",      202208, 4,"USA", 40000000],
    //   ["X-Energy",      202110, 3,"USA", null],
    //   ["X-Energy",      202005, 2,"USA", 6000000],
    //   ["X-Energy",      201501, 1,"USA", null],
    //   ["Tokamak",       202001, 7,"UK", 71000000],
    //   ["Tokamak",       201902, 6,"UK", 20000000],
    //   ["Tokamak",       201806, 5,"UK", 17000000],
    //   ["Tokamak",       201708, 4,"UK", 4000000],
    //   ["Tokamak",       201701, 3,"UK", 11000000],
    //   ["Tokamak",       201604, 2,"UK", 4000000],
    //   ["Tokamak",       201403, 1,"UK", 4200000],
    //   ["Kyoto",         202202, 5,"Japan", 9000000],
    //   ["Kyoto",         202202, 4,"Japan", 4800000],
    //   ["Kyoto",         202101, 3,"Japan", 802000],
    //   ["Kyoto",         202010, 2,"Japan", 1000000],
    //   ["Kyoto",         202001, 1,"Japan", 500000],
    //   ["Thorizon",      202208, 1,"Netherlands", 12500000]
    // ]);

    dataStartups = google.visualization.arrayToDataTable([

      ["ID",           'Month', "Funding Round Amount (USD)","Country", "Cumulative Funding (USD)"],
      ["TAE Technologies",           202256,  250000000  ,"USA", 1115500000],
      ["TAE Technologies",           202132,  130000000  ,"USA", 865500000],
      ["TAE Technologies",           201940,  null  ,"USA", 735500000],
      ["TAE Technologies",           201908,  153500000  ,"USA", 735500000],
      ["TAE Technologies",           201872,  40000000  ,"USA", 582000000],
      ["TAE Technologies",           201708,  128000000  ,"USA", 542000000],
      ["TAE Technologies",           201640,  65000000  ,"USA", 414000000],
      ["TAE Technologies",           201508,  82000000  ,"USA", 349000000],
      ["TAE Technologies",           201224,  127000000  ,"USA", 267000000],
      ["TAE Technologies",           201008,  null  ,"USA", null],
      ["Commonwealth",  202196,  1800000000  ,"USA", 1999000000],
      ["Commonwealth",  202040,  84000000  ,"USA", 199000000],
      ["Commonwealth",  201948,  115000000  ,"USA", 115000000],
      ["Commonwealth",  201948,  null  ,"USA", null],
      ["TerraPower",    202264,  750000000  ,"USA", 758600000],
      ["TerraPower",    202224,  8600000  ,"USA", 8600000],
      ["TerraPower",    200896,  null  ,"USA", null],
      ["TerraPower",    200808,  null  ,"USA", null],
      ["Helion",        202188,  500000000  ,"USA", 577800000],
      ["Helion",        202008,  40000000  ,"USA", 77800000],
      ["Helion",        201908,  10000000  ,"USA", 37800000],
      ["Helion",        201608,  21300000  ,"USA", 27800000],
      ["Helion",        201580,  5000000  ,"USA", 6500000],
      ["Helion",        201556,  null  ,"USA", 1500000],
      ["Helion",        201464,  1500000  ,"USA", 1500000],
      ["NuScale",       202240,  235000000  ,"USA", 469600000],
      ["NuScale",       202164,  152000000  ,"USA", 234600000],
      ["NuScale",       202132,  40000000  ,"USA", 82600000],
      ["NuScale",       201832,  40000000  ,"USA", 42600000],
      // ["NuScale",    200824,  2600000  ,"USA", 2600000],
      ["General",       202188,  120000000  ,"Canada", 260500000],
      ["General",       202108,  null  ,"Canada", 140500000],
      ["General",       202056,  null  ,"Canada", 140500000],
      ["General",       201996,  65000000  ,"Canada", 140500000],
      ["General",       201924,  null  ,"Canada", 75500000],
      ["General",       201880,  36000000  ,"Canada", 75500000],
      ["General",       201624,  13000000  ,"Canada", 39500000],
      ["General",       201540,  20000000  ,"Canada", 26500000],
      ["General",       201416,  6500000  ,"Canada", 6500000],
      ["General",       201356,  null  ,"Canada", null],
      ["Zap",           202248,  160000000  ,"USA", 202800000],
      ["Zap",           202140,  27500000  ,"USA", 42800000],
      ["Zap",           202056,  6500000  ,"USA", 15300000],
      ["Zap",           202032,  1000000  ,"USA", 8800000],
      ["Zap",           201996,  1000000  ,"USA", 7800000],
      ["Zap",           201888,  6800000  ,"USA", 6800000],
      ["First Light",   202216,  45000000  ,"UK", 95000000],
      ["First Light",   202148,  null  ,"UK", 50000000],
      ["First Light",   202096,  25000000  ,"UK", 50000000],
      ["First Light",   201788,  null  ,"UK", 25000000],
      ["First Light",   201564,  24000000  ,"UK", 25000000],
      ["First Light",   201380,  null  ,"UK", 1000000],
      ["First Light",   201156,  1000000  ,"UK", 1000000],
      ["Terrestrial",   202188,  3000000  ,"Canada", 68700000],
      ["Terrestrial",   202140,  19000000  ,"Canada", 65700000],
      ["Terrestrial",   202056,  5000000  ,"Canada", 46700000],
      ["Terrestrial",   201924,  15000000  ,"Canada", 41700000],
      ["Terrestrial",   201772,  6000000  ,"Canada", 26700000],
      ["Terrestrial",   201672,  5000000  ,"Canada", 20700000],
      ["Terrestrial",   201624,  5000000  ,"Canada", 15700000],
      ["Terrestrial",   201608,  10000000  ,"Canada", 10700000],
      ["Terrestrial",   201596,  700000  ,"Canada", 700000],
      ["Seaborg",       202088,  20000000  ,"Denmark", 21500000],
      ["Seaborg",       201832,  1500000  ,"Denmark", 1500000],
      ["Avalanche",     202264,  23000000  ,"USA", 23000000],
      ["Avalanche",     201388,  null  ,"USA", null],
      ["Zeno",          202232,  20000000  ,"USA", 21920000],
      ["Zeno",          202008,  1800000  ,"USA", 1920000],
      ["Zeno",          201956,  120000  ,"USA", 120000],
      ["USNC",          202008,  17400000  ,"USA", 17400000],
      ["LeadCold",      202056,  540000  ,"Sweden", 18677000],
      ["LeadCold",      201680,  18000000  ,"Sweden", 18137000],
      ["LeadCold",      201596,  137000  ,"Sweden", 137000],
      ["X-Energy",      202264,  40000000  ,"USA", 46000000],
      ["X-Energy",      202180,  null  ,"USA", 6000000],
      ["X-Energy",      202040,  6000000  ,"USA", 6000000],
      ["X-Energy",      201508,  null  ,"USA", null],
      ["Tokamak",       202008,  71000000  ,"UK", 131200000],
      ["Tokamak",       201916,  20000000  ,"UK", 60200000],
      ["Tokamak",       201848,  17000000  ,"UK", 40200000],
      ["Tokamak",       201764,  4000000  ,"UK", 23200000],
      ["Tokamak",       201708,  11000000  ,"UK", 19200000],
      ["Tokamak",       201632,  4000000  ,"UK", 8200000],
      ["Tokamak",       201424,  4200000  ,"UK", 4200000],
      ["Kyoto",         202216,  9000000  ,"Japan", 16102000],
      ["Kyoto",         202216,  4800000  ,"Japan", 7102000],
      ["Kyoto",         202108,  802000  ,"Japan", 2302000],
      ["Kyoto",         202080,  1000000  ,"Japan", 1500000],
      ["Kyoto",         202008,  500000  ,"Japan", 500000],
      ["Thorizon",      202264,  12500000  ,"Netherlands", 125000000]
    ]);

    var startupsData = response.getDataTable();

    var startupsView = new google.visualization.DataView(startupsData);
    startupsView.setColumns([0,2,3,4,5])


    var optionsStartups = {
      // title: 'Nuclear Startup Funding Rounds',
      backgroundColor: 'transparent',
      width: document.querySelector(".gif-card-column").clientWidth,
      height: 430,
      hAxis: {title: 'Year', 
        format: '',
        textStyle: {color: 'black'},
        viewWindow: {max:202350},
        gridlines: {color: 'black'},
        ticks: [{v:201000, f:'2010'}, {v:201200, f:'2012'}, {v:201400, f:'2014'}, {v:201600, f:'2016'}, {v:201800, f:'2018'}, {v:202000, f:'2020'}, {v:202200, f:'2022'}, {v:202400, f:'2022'}]
      },
      vAxis: {title: 'Funding Raised (USD)',
        format: 'short',
        textStyle: {color: 'black'},
        logScale: true, gridlines: {color: 'black'}
      },
      // theme: 'maximized',
      legend: {position: 'in', textStyle: {fontSize: 10}},
      chartArea:{left:'8%', top:'2%',width:'80%',height:'90%'},
      bubble: {textStyle: {fontSize: 80, auraColor: 'none'}, stroke: 'black'},
      animation:{
        duration: 2000,
        easing: 'out',
        startup: true,
      }
    };


    // var optionsConstructPlanned = {
    //   backgroundColor: "#01cd9b",
    //   width: document.querySelector(".gif-card-column").clientWidth,
    //   height: 425,
    //   displayMode: 'markers',
    //   tooltip: { isHtml: true, backgroundColor:'#99ABB8' },
    //   // colorAxis: {colors: ['green', 'blue']
    // }
  
    var chartStartups = new google.visualization.BubbleChart(document.getElementById('visualizationStartups'));
    chartStartups.draw(dataStartups, optionsStartups);
  
  
    // function createCustomHTMLContent(flagURL, plantName, plantStatus, reactorType, thermalPower) {
    //   return '<div style="padding:5px 5px 5px 5px;">' +
    //       '<img src="' + flagURL + '" style="width:25px;height:15px">' +
    //       " " + '<b>' + plantName + '</b><br/>' +
    //       "Status: " + '<b>' + plantStatus + '</b><br/>' +
    //       "Type: " + '<b>' + reactorType + '</b><br/>' +
    //       "Power: " + '<b>' + thermalPower + "MW" + '</b><br/>' + '</div>';
    // }
  
  };
})


// make the expanding heatmap tiles
// var heatmapBoxs = [...document.querySelectorAll('.heatmap-box')]
// heatmapBoxs.forEach(function(item){

//   item.addEventListener('click', function(e){

//     if (e.target && e.target.matches('a')) {
//     } else {
//       if (e.target && e.target.matches('.heatmap-box')) {
//         e.target.classList.toggle('heatmap-box-expanded');
//         e.target.querySelector('table').classList.toggle('d-none');
//         e.target.querySelector('h5').classList.toggle('d-none');
//         heatmapBoxs.forEach(function(el){
//           if (el != e.target) {
//             el.classList.toggle('heatmap-box-condensed');       
//           }
//         })


//       } else if(e.target && e.target.matches('h5')) {
//         console.log("gotcha");
//         parentE = e.target.parentElement
//         parentE.classList.toggle('heatmap-box-expanded');
//         parentE.querySelector('table').classList.toggle('d-none');
//         parentE.querySelector('h5').classList.toggle('d-none');
//         heatmapBoxs.forEach(function(el){
//           if (el != parentE) {
//             el.classList.toggle('heatmap-box-condensed');       
//           }
//         })
//       }

//       document.querySelector('#heatmap_close').classList.toggle('d-none');
//       document.querySelector('#heatmap').classList.toggle('w-100')
//     }

//   })

// });

var heatmapBoxs = [...document.querySelectorAll('.heatmap-box')]
heatmapBoxs.forEach(function(item){

  item.addEventListener('click', function(e){

    if (e.target && e.target.matches('span')) {
      window.open(e.target.attributes.href.textContent);
    } else {
      if (e.target && e.target.matches('.heatmap-box')) {
        e.target.classList.add('heatmap-box-expanded');
        e.target.querySelector('table').classList.remove('d-none');
        e.target.querySelector('h5').classList.add('d-none');
        heatmapBoxs.forEach(function(el){
          if (el != e.target) {
            el.classList.add('heatmap-box-condensed');       
          }
        })


      } else if(e.target && e.target.matches('h5')) {
        parentE = e.target.parentElement
        parentE.classList.add('heatmap-box-expanded');
        parentE.querySelector('table').classList.remove('d-none');
        parentE.querySelector('h5').classList.add('d-none');
        heatmapBoxs.forEach(function(el){
          if (el != parentE) {
            el.classList.add('heatmap-box-condensed');       
          }
        })
      }

      document.querySelector('#heatmap_close').classList.remove('d-none');
      document.querySelector('#heatmap').classList.add('w-100');
    }

  })

});

document.querySelector('#heatmap_close').addEventListener('click', function(e){

heatmapBoxs.forEach(function(item){

  item.classList.remove("heatmap-box-expanded");
  item.classList.remove("heatmap-box-condensed");
  item.querySelector('table').classList.add('d-none');
  item.querySelector('h5').classList.remove('d-none');
  document.querySelector('#heatmap_close').classList.add('d-none');
  document.querySelector('#heatmap').classList.remove('w-100')
  })

});



// document.querySelector('#heatmap_close').addEventListener('click', () =>{
//   // document.activeElement.style.width = '100%';
//   // document.activeElement.style.height = '100%';
//   // console.log(heatmapBoxs);
//   document.querySelector('#heatmap_close').classList.('d-none')

//   heatmapBoxs.forEach(function(e){
//     e.classList.remove('heatmap-box-condensed');
//     e.classList.remove('heatmap-box-expanded');


//     if (e != document.activeElement) {
//       // console.log(e);
//       // e.style.width = '0px';
//       // e.style.height = '0px';
//       // e.style.border = 'none';
//     }
//   })
// })


// fade in the FLR graph cards when the previous one sticks

const stickyElm = document.querySelector('.FLRcardcolumn')

const observerCard2 = new IntersectionObserver( 
  ([e]) => e.target.classList.toggle('stuckCard', e.intersectionRatio < 1),
  {rootMargin: '50px', threshold: [1.0]}
);

observerCard2.observe(stickyElm)

// sticky the cards at the top of the page

var observerCard = new IntersectionObserver(StickCardCallback, {
  rootMargin: "5px",
  threshold: [1.0]
} )

observerCard.observe(document.querySelector(".FLRcardcolumn"));

function StickCardCallback(entries,observer){
  entries.forEach((entry) => {
  console.log(entry.intersectionRatio);
  //  entry.target.style.opacity = entry.intersectionRatio;
;

   if (entry.intersectionRatio === 1.0) {
    entry.target.classList.add('opaqueCard')
    // document.querySelector(".FLRcardcolumn").classList.add('opaqueCard');
    // document.querySelector("#section1").classList.add("sticky-top") 
    // document.querySelector("#FLRbluecard").classList.add("stuckCard") 
    // document.querySelector("#section1").style.left = "50%" 
    // document.querySelector("#section1").style.top = "50%" 
    // document.querySelector("#section1").style.transform = "translate(-50%, -50%)" 

    // document.querySelector("#section2").style.position = "fixed" 
  }
  });
}


const blockCardGif = document.querySelector('.gif-card')

const observerGifCard = new IntersectionObserver( 
  ([e]) => e.target.classList.toggle('stuckCard', e.intersectionRatio < 1),
  {rootMargin: '50px', threshold: [1.0]}
);

observerCard2.observe(stickyElm)


