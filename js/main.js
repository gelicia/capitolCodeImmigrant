var minLongLat = [46.0000,94.0000];
var continentData;
var countryData;
var thisYear;

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function loadData(year){
	var loadCountryDataPromise = loadContinentCountryData(year);

	loadCountryDataPromise.done(function(){
		loadMap().done(function(){
			drawData();	
		});
	});
}

var projection = d3.geo.mercator() 
    .scale(100)
    .translate([320, 300])
    .precision(0.1);

var path = d3.geo.path().projection(projection);

function loadContinentCountryData(gl_year){
	var def = $.Deferred();
	thisYear = gl_year;
	var loadContinentPromise = loadContinentData(gl_year);
	loadContinentPromise.done(
		function(continentReturn){
			continentData = continentReturn;
		}
	);
	var loadCountryPromise = loadCountryData(gl_year);
	loadCountryPromise.done(
		function(countryReturn){
			countryData = countryReturn;
			def.resolve();
		}
	);
	return def.promise();
}

function loadContinentData(year){
	var def = $.Deferred();
	var continentData = {};
	d3.csv("data/byContinent.csv", function(err, data){
		for (var i = 0; i < data.length; i++) {
			continentData[data[i].key] = parseInt(data[i][year], 10);
		}
		def.resolve(continentData);
	});
	return def.promise();
}

function loadCountryData(year){
	var def = $.Deferred();
	var countryData = [];
	d3.csv("data/byCountry.csv", function(err, data){
		for (var i = 0; i < data.length; i++) {
			var thisCountryData = {};
			thisCountryData.CountryID = data[i].countryID;
			thisCountryData.CountryNameMN = data[i].CountryNameMN;
			thisCountryData.CountryNameMap = data[i].CountryNameMap;
			thisCountryData.immCount = parseInt(data[i][year],10);
			countryData.push(thisCountryData);
		}
		def.resolve(countryData);
	});
	return def.promise();
}

function loadMap(){
	var def = $.Deferred();
	var svg = d3.selectAll("svg#mapMain");
	var g = svg.append("g");

	d3.json("data/map/output.json", function(errorMap, world) {
		worldMapData = world;
		var features = topojson.feature(topojson.presimplify(world), world.objects.countries).features.filter(function(d){if (d.id != 10){return d;} });

		g.selectAll("path")
		.data(features).enter().append("path")
		.attr({
			d: path,
			id: function(d) {return "m_" + d.id;},
			stroke: '#000',
			'stroke-opacity': 0.5,
			'stroke-width': 1,
			fill: '#f2f2f2'
		});

		def.resolve();
	});
	return def.promise();
}

function drawData(){
	countryData.sort(function(a, b) {
		if (a.immCount > b.immCount){
			return -1;
		}
		else if (a.immCount < b.immCount){
			return 1;
		}
		return 0;
	});

	var dataRange = d3.extent(countryData, function(d){return d.immCount;});
	var colorRange = d3.scale.linear().domain(dataRange).range(['#CCC', '#6B66D4']);

	for (var i = 0; i < countryData.length; i++) {	
		d3.select("#m_" + countryData[i].CountryID).transition().duration(500).attr({
			fill: !isNaN(countryData[i].immCount) ? colorRange(countryData[i].immCount) : '#CCC'
		});
	}	

	d3.select("#year").text(thisYear);
	d3.select("#extent").text("There was " + continentData["All Countries"] + " total immigrants for this year. The country with the most was " + countryData[0].CountryNameMap + " with " + countryData[0].immCount + " immigrants moving to Minnesota.");
}

function changeYear(year){
	thisYear = year;
	var loadCountryDataPromise = loadContinentCountryData(year);

	loadCountryDataPromise.done(function(){
		drawData();	
	});
}