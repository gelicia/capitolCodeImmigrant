var minLongLat = [46.0000,94.0000];
var gl_year = 2010;

function loadData(){
	var loadCountryDataPromise = loadContinentCountryData();

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

var continentData;
var countryData;

function loadContinentCountryData(){
	var def = $.Deferred();
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
			'class': function(d){
				var thisData = _.find(countryData, function(fd){ return d.id == fd.mapID;});
				return thisData === undefined ? "invalidCountry" : "validCountry";
			}
		});

		def.resolve();
	});
	return def.promise();
}

function drawData(){
	var dataRange = d3.extent(countryData, function(d){return d.immCount;});
	console.log(dataRange);
}


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};