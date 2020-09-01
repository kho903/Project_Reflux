function busan_map(_mapContainerId, _spots, dict_a, dict_b, dict_c, dict_d) {
    var WIDTH, HEIGHT,
        CENTERED,
        MAP_CONTAINER_ID = _mapContainerId,
        busan = 'busan_sig';

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

            // var color = d3.scaleThreshold()
            //     .domain([1,2,9,10,12,14,15])
            //     .range([/*"rgb(247,251,255)",*/ "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

            // var color = [/*"rgb(247,251,255)", */ "rgb(222,235,247)", /*"rgb(198,219,239)",*/ "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"];
            // var color = [/*"rgb(247,251,255)", */ "rgb(222,235,247)", /*"rgb(198,219,239)",*/ "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"];

            map.selectAll("path")
                .data(features)
                .enter().append("path")

                // .attr("style", function(d,i){
                //     console.log("d는 ");
                //     return "fill: " + color(i);
                // })
                // .attr("style", function(d,i){
                //     var each_level = dict_d[d.properties.SIG_KOR_NM];
                //     return "fill: " + color[each_level];
                // })

                .attr("class", function (d) {
                    return "municipality c " + d.properties.SIG_KOR_NM;
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
                //     return d.properties.SIG_KOR_NM;
                // });

            callback();
        });
    }

    function spotting_on_map() {
        var circles = map.selectAll("circle")
            .data(_spots).enter()
            .append("circle")
            .attr("class", "spot")
            .attr("cx", function (d) {
                return 100;
            })
            .attr("cy", function (d, i) {
                return [290, 320, 350, 380][i];
            })
            .attr("r", "10px")
            .attr("fill", function (d, i) {
                return ["rgb(109,177,0)", "rgb(0, 99, 132)", "rgb(77, 11, 88)", "rgb(255,0,9)"][i]
            })
            .on('click', spot_clicked_event)
            .transition()
            .ease(d3.easeElastic);
    }


    function spot_clicked_event(d, p) {
        var color;
        var each_level;
        switch (p) {
            case 0:
                color = d3.scaleLinear()
                    .domain([0, 100])
                    .range(["rgb(241,255,200)", "rgb(109,177,0)"]);
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
                    .range(["rgb(255, 240, 243)", "rgb(255,0,9)"]);
                break;
        }

        map.selectAll("path")
            .data(features)
            // .enter().append("path")

            .attr("style", function (d, i) {
                console.log(p);
                switch (p) {
                    case 0:
                        each_level = dict_a[d.properties.SIG_KOR_NM] * 1.5;
                        break;
                    case 1:
                        each_level = dict_b[d.properties.SIG_KOR_NM] * 250000000;
                        break;
                    case 2:
                        each_level = dict_c[d.properties.SIG_KOR_NM] * 4000;
                        break;
                    case 3:
                        each_level = dict_d[d.properties.SIG_KOR_NM] * 15;
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
            if (d.properties.SIG_KOR_NM == '강서구' || d.properties.SIG_KOR_NM == '기장군')
                zoomLevel = 1.5;
            else
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