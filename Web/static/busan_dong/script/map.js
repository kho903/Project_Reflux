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


            var color = d3.scaleLinear()
                .domain([0, 100])
                .range(["#f2dfd3", "#964b00"]);

            // tooltip 생성(map 각 동별로 hover 시 동 이름 띄우기)
            var tooltip = d3.select("#map").append("g")
                .attr('class', 'hidden tooltip');

            map.selectAll("path")
                .data(features)
                .enter().append("path")
                .attr('class', function (d) {
                    return 'province ' + d.properties.EMD_KOR_NM;
                })
                .attr('d', path)
                .on('mousemove', function (d) {
                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    });
                    console.log(mouse);
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 35) +
                            'px; top:' + (mouse[1] - 35) + 'px')
                        .text(d.properties.EMD_KOR_NM);
                })
                .on('mouseout', function () {
                    tooltip.classed('hidden', true);
                })
                .attr("class", function (d) {
                    return "municipality c " + d.properties.EMD_KOR_NM;
                })
                .attr("d", path)
                .on("click", province_clicked_event)
                // 지도 애니메이션 duration() 시간별로 색깔 각각 지정 후 main.html 에서
                // 받아온 각 딕셔너리별로 each_level을 정해서 색 변경
                // color = d3.scleLinear() 함수는 range(시작색, 끝색) 으로 각각 100단계로 쪼개서 각각의 색을 지정
                // each_level = dict_**[d.properties.EMD_KOR_NM] 뒤에 수치를 곱하여 [0, 100]단위로 임의 정규화
                .transition().duration(2000).delay(1000)
                .attr("style", function (d, i) {
                    color = d3.scaleLinear()
                        .domain([0, 100])
                        .range(["#f2dfd3", "#964b00"]);
                    each_level = dict_high[d.properties.EMD_KOR_NM] * 2;
                    return "fill: " + color(Math.ceil(each_level));
                })
                .transition().duration(3000)
                .attr("style", function (d, i) {

                    color = d3.scaleLinear()
                        .domain([0, 100])
                        .range(["rgb(184, 237, 255)", "rgb(0, 99, 132)"]);

                    each_level = dict_pump[d.properties.EMD_KOR_NM] * 500000000;
                    return "fill: " + color(Math.ceil(each_level));
                })
                .transition().duration(4000)
                .attr("style", function (d, i) {
                    color = d3.scaleLinear()
                        .domain([0, 100])
                        .range(["rgb(250, 219, 255)", "rgb(77, 11, 88)"]);

                    each_level = dict_manhole[d.properties.EMD_KOR_NM] * 5000;
                    return "fill: " + color(Math.ceil(each_level));

                })

                .transition().duration(5000)
                .attr("style", function (d, i) {
                    color = d3.scaleLinear()
                        .domain([0, 100])
                        .range(["rgb(241,255,200)", "rgb(109,177,0)"]);

                    each_level = dict_imp[d.properties.EMD_KOR_NM] * 2.5;

                    return "fill: " + color(Math.ceil(each_level));
                })
            ;

            map.selectAll("text")
                .data(features)
                .enter().append("text")
                .attr("transform", function (d) {
                    return "translate(" + path.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .attr("class", "municipality-label")
            // 지도에 모든 동 이름을 표시 (동이 너무 많아 복잡)
            // .text(function (d) {
            //     return d.properties.EMD_KOR_NM;
            // })
            ;

            callback();
        });
    }
    // 지도 위 동그라미
    // 각각 눌렀을 때 고도, 펌프, 맨홀, 불투수면 비 지도에 표시
    function spotting_on_map() {
        var circles = map.selectAll("circle")
            .data(_spots).enter()
            .append("circle")
            .attr("class", "spot")
            .attr("cx", function (d, i) {
                return [100, 130, 160, 190][i];
            })
            .attr("cy", function (d) {
                return [230];
            })
            .attr("r", "10px")
            .attr("fill", function (d, i) {
                return ["brown", "rgb(0, 99, 132)", "rgb(77, 11, 88)", "rgb(109,177,0)"][i]
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
                    .range(["rgb(241,255,200)", "rgb(109,177,0)"]);
                break;
        }

        map.selectAll("path")
            .data(features)
            // .enter().append("path")

            .attr("style", function (d, i) {
                switch (p) {
                    case 0:
                        each_level = dict_high[d.properties.EMD_KOR_NM] * 2;
                        break;
                    case 1:
                        each_level = dict_pump[d.properties.EMD_KOR_NM] * 500000000;
                        break;
                    case 2:
                        each_level = dict_manhole[d.properties.EMD_KOR_NM] * 5000;
                        break;
                    case 3:
                        each_level = dict_imp[d.properties.EMD_KOR_NM] * 2.5;
                        break;
                }
                return "fill: " + color(Math.ceil(each_level));
            })
    }
    
    // 클릭시 확대 이벤트
    function province_clicked_event(d) {
        var x, y, zoomLevel;

        if (d && CENTERED != d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            zoomLevel = 1.5;
            CENTERED = d;
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
            .duration(450)
            .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")scale(" + zoomLevel + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / zoomLevel + "px");
    }

    create(function () {
        spotting_on_map();
    });
}