function busan_dong_map(_mapContainerId, _spots, dict_high, dict_pump, dict_manhole, dict_imp) {
    var WIDTH, HEIGHT,
        CENTERED,
        MAP_CONTAINER_ID = _mapContainerId,
        busan = 'emd';

    var projection, path, svg,
        geoJson, features, bounds, center,
        map, places;

    function create(callback) {
        HEIGHT = window.innerHeight;
        WIDTH = 1200;

        console.log('Map scale', {'height': HEIGHT, 'width': WIDTH});

        projection = d3.geoMercator().translate([WIDTH / 2, HEIGHT / 2]);
        path = d3.geoPath().projection(projection);

        svg = d3.select(MAP_CONTAINER_ID).append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT);

        map = svg.append("g").attr("id", "map");
        places = svg.append("g").attr("id", "places");


        d3.json(BUSAN_JSON_DATA_URL).then(function (_data) {
            geoJson = topojson.feature(_data, _data.objects[busan]);
            features = geoJson.features;

            bounds = d3.geoBounds(geoJson);
            center = d3.geoCentroid(geoJson);

            var distance = d3.geoDistance(bounds[0], bounds[1]);
            var scale = HEIGHT / distance / Math.sqrt(2) * 1.2;

            projection.scale(scale).center(center);


            // var color = [/*"rgb(247,251,255)", */ "rgb(222,235,247)", /*"rgb(198,219,239)",*/ "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"];
            var color = d3.scaleLinear()
                .domain([0, 100])
                .range(["#f2dfd3", "#964b00"]);

            console.log(color());

            map.selectAll("path")
                .data(features)
                .enter().append("path")

                // .attr("style", function(d,i){
                //     var each_level = dict_high[d.properties.EMD_KOR_NM];
                //     console.log(Math.ceil(each_level));
                //     return "fill: " + color(Math.ceil(each_level));
                // })

                .attr("class", function (d) {
                    return "municipality c " + d.properties.EMD_KOR_NM;
                })
                .attr("d", path)
                .on("click", province_clicked_event);

            map.selectAll("text")
                .data(features)
                .enter().append("text")
                .attr("transform", function (d) {
                    return "translate(" + path.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .attr("class", "municipality-label")
            // .text(function (d) {
            //     return d.properties.EMD_KOR_NM;
            // });

            callback();
        });
    }

    function spotting_on_map() {
        var circles = map.selectAll("circle")
            .data(_spots).enter()
            .append("circle")
            .attr("class", "spot")
            .attr("cx", function (d, i) {
                console.log("프로젝션 ", projection([d.lon, d.lat])[0]);
                return [100, 130, 160, 190][i];
            })
            .attr("cy", function (d) {
                return [230];
            })
            .attr("r", "10px")
            .attr("fill", function (d, i) {
                return ["brown", "rgb(0, 99, 132)", "rgb(77, 11, 88)", "rgb(255, 99, 132)"][i]
            })
            .on('click', spot_clicked_event)
            .transition()
            .ease(d3.easeElastic);
    }

    function spot_clicked_event(d, p) {
        console.log(p);
        var color;
        var each_level;
        switch (p) {
            case 0:
                color = d3.scaleLinear()
                    .domain([0, 100])
                    .range(["#f2dfd3", "#964b00"]);
                break;
            case 1:
                color = d3.scaleLinear()
                    .domain([0, 100])
                    .range(["rgb(184, 237, 255)", "rgb(0, 99, 132)"]);
                break;
            case 2:
                color = d3.scaleLinear()
                    .domain([0, 100])
                    .range(["rgb(250, 219, 255)", "rgb(77, 11, 88)"]);
                break;
            case 3:
                color = d3.scaleLinear()
                    .domain([0, 100])
                    .range(["rgb(255, 240, 243)", "rgb(255, 99, 132)"]);
                break;
        }

        map.selectAll("path")
            .data(features)
            // .enter().append("path")

            .attr("style", function (d, i) {
                console.log(p);
                switch (p) {
                    case 0:
                        each_level = dict_high[d.properties.EMD_KOR_NM]*2;
                        break;
                    case 1:
                        each_level = dict_pump[d.properties.EMD_KOR_NM] * 500000000;
                        break;
                    case 2:
                        each_level = dict_manhole[d.properties.EMD_KOR_NM]*5000;
                        break;
                    case 3:
                        each_level = dict_imp[d.properties.EMD_KOR_NM]*2.5;
                        break;
                }
                return "fill: " + color(Math.ceil(each_level));
            })
    }


    function province_clicked_event(d) {
        var x, y, zoomLevel;

        if (d && CENTERED != d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            zoomLevel = 2;
            CENTERED = d;
            // console.log('centered', CENTERED);
        } else {
            x = WIDTH / 2;
            y = HEIGHT / 2;
            zoomLevel = 1;
            CENTERED = null;
        }

        map.selectAll("path")
            .classed("active", CENTERED && function (d) {
                return d === CENTERED;
            });

        map.transition()
            .duration(750)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / zoomLevel + "px");
    }

    create(function () {
        spotting_on_map();
    });
}