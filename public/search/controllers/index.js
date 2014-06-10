angular.module('mean.system').controller('ResultController', ['$scope', '$location', '$http', 'Global', function ($scope, $location, $http, Global) {
    Scope = $scope;
    $scope.global = Global;

    $scope.searchQuery = decodeURI($location.url().substring(8));
    $scope.brands = [];
    $scope.currentItem = null;

    $scope.init = function () {
        $http.post('/articlewithname/' + encodeURI($scope.searchQuery), {'foo':'bar'})
        .success(function(data, status, headers, config) {
            $scope.data = data;
            $scope.getBrands();
            $scope.groupedData = $scope.groupBrands();
            $scope.d3Init($scope.groupedData, 'price');
        }).error(function(data, status, headers, config) {
            $scope.status = status;
        });
    };

    $scope.byPrice = function () {
        $scope.d3Init($scope.groupedData, 'price');
    };

    $scope.byPopularity = function () {
        $scope.d3Init($scope.groupedData, 'popularity');
    };

    $scope.byReleaseDate = function () {
        $scope.d3Init($scope.groupedData, 'popularity');
    };

    $scope.getBrands = function () {
        for (var i = 0; i<$scope.data.children.length; i++) {
            var name = $scope.data.children[i].name;
            var firstWord = '';
            for (var j=0;j<name.length;j++)
            {
                if (name[j]==' ')
                    break;
                else
                    firstWord = firstWord + name[j];
            }
            $scope.brands.push(firstWord);
        };
        $scope.brands = $scope.brands.filter(function(elem, pos) {
            return $scope.brands.indexOf(elem) == pos;
        });
    };

    $scope.groupBrands = function () {
        var categoryList = [];
        for (var i = 0; i<$scope.brands.length; i++) {
            var brand = $scope.brands[i];
            var brandList = [];
            for (var j = 0; j<$scope.data.children.length; j++) {
                var item = $scope.data.children[j];
                if (item.name.indexOf(brand) == 0) {
                    item.name = item.name.replace(brand, "");
                    brandList.push(item);
                }
            }
            categoryList.push({
                'name': brand,
                'children': brandList
            });
        }
        var root = {'name': '전체', 'children': categoryList};
        return root;
    };

    $scope.d3Init = function(root, property) {
        document.getElementById('graph').innerHTML = '';
        var margin = 20,
        diameter = 700;

        var color = d3.scale.linear()
        .domain([-1, 5])
        .range(['hsl(200,80%,80%)', 'hsl(128,30%,40%)'])
        .interpolate(d3.interpolateHcl);

        var pack = d3.layout.pack()
        .padding(2)
        .size([diameter - margin, diameter - margin])
        .value(function(d) { return d[property]; })

        var svg = d3.select('#graph').append('svg')
        .attr('width', diameter)
        .attr('height', diameter)
        .append('g')
        .attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

        var focus = root,
        nodes = pack.nodes(root),
        view;

        var circle = svg.selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('class', function(d) { return d.parent ? d.children ? 'node' : 'node node--leaf' : 'node node--root'; })
        .style('fill', function(d) { return color(d.depth); })
        .on('click', function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

        var text = svg.selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('class', 'label')
        .style('fill-opacity', function(d) { return d.parent === root ? 1 : 0; })
        .style('display', function(d) { return d.parent === root ? null : 'none'; })
        .text(function(d) { return d.name; });

        var node = svg.selectAll('circle,text');

        d3.select('#graph')
        .style('background', color(-1))
        .on('click', function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus; focus = d;

            if (d.children) {
                var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween('zoom', function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });
            } else {
                var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween('zoom', function(d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 4 + margin]);
                    return function(t) { zoomTo(i(t)); };
                });
            }

            transition.selectAll('text')
            .filter(function(d) { return d.parent === focus || d === focus || this.style.display === 'inline'; })
            .style('fill-opacity', function(d) { return d.parent === focus || d === focus ? 1 : 0; })
            .each('start', function(d) { if (d.parent === focus) this.style.display = 'inline'; })
            $scope.$apply(function () {
                $scope.currentItem = d;
            });
        }

        function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr('transform', function(d) { return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')'; });
            circle.attr('r', function(d) { return d.r * k; });
        }
        d3.select(self.frameElement).style('height', diameter + 'px');

        $scope.currentItem = root;
    };



}]);
