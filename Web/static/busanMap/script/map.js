function busan_map(_mapContainerId, _spots) {
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

        map = svg.append("g").attr("id", "map"),
            places = svg.append("g").attr("id", "places");


        d3.json(BUSAN_JSON_DATA_URL).then(function (_data) {
            geoJson = topojson.feature(_data, _data.objects[busan]);
            features = geoJson.features;

            bounds = d3.geoBounds(geoJson);
            center = d3.geoCentroid(geoJson);

            var distance = d3.geoDistance(bounds[0], bounds[1]);
            var scale = HEIGHT / distance / Math.sqrt(2) * 1.2;

            projection.scale(scale).center(center);

            console.log("center", center);
            console.log("scale", scale);

            map.selectAll("path")
                .data(features)
                .enter().append("path")
                .attr("class", function (d) {
                    console.log(d);
                    return "municipality c " + d.properties.code;
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
                .text(function (d) {
                    return d.properties.SIG_KOR_NM;
                });

            callback();
        });
    }

    function spotting_on_map() {
        var circles = map.selectAll("circle")
            .data(_spots).enter()
            .append("circle")
            .attr("class", "spot")
            .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
            })
            .attr("r", "2px")
            .attr("fill", "red")
            .on('click', spot_clicked_event)
            .transition()
            .ease(d3.easeElastic);
    }

    function spot_clicked_event(d) {
        alert(d['tag']);
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
            console.log('centered', CENTERED);
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
    })
}