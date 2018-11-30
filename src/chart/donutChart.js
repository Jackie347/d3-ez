import * as d3 from "d3";
import palette from "../palette";
import dataTransform from "../dataTransform";
import component from "../component";

/**
 * Donut Chart (also called: Doughnut Chart; Pie Chart)
 *
 * @module
 * @see http://datavizproject.com/data-type/donut-chart/
 */
export default function() {

	/* Default Properties */
	let svg;
	let chart;
	let classed = "donutChart";
	let width = 400;
	let height = 300;
	let margin = { top: 20, right: 20, bottom: 20, left: 20 };
	let transition = { ease: d3.easeCubic, duration: 750 };
	let colors = palette.categorical(3);
	let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

	/* Chart Dimensions */
	let chartW;
	let chartH;
	let radius;
	let innerRadius;

	/* Scales */
	let colorScale;

	/**
	 * Initialise Data and Scales
	 *
	 * @private
	 * @param {Array} data - Chart data.
	 */
	function init(data) {
		chartW = width - (margin.left + margin.right);
		chartH = height - (margin.top + margin.bottom);

		// If the radius has not been passed then calculate it from width/height.
		radius = (typeof radius === "undefined") ?
			(Math.min(chartW, chartH) / 2) :
			radius;

		innerRadius = (typeof innerRadius === "undefined") ?
			(radius / 2) :
			innerRadius;

		// Slice Data, calculate totals, max etc.
		let dataSummary = dataTransform(data).summary();
		let seriesNames = dataSummary.columnKeys;

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = (typeof colorScale === "undefined") ?
			d3.scaleOrdinal().domain(seriesNames).range(colors) :
			colorScale;
	}

	/**
	 * Constructor
	 *
	 * @constructor
	 * @alias donutChart
	 * @param {d3.selection} selection - The chart holder D3 selection.
	 */
	function my(selection) {
		// Create SVG element (if it does not exist already)
		if (!svg) {
			svg = (function(selection) {
				let el = selection._groups[0][0];
				if (!!el.ownerSVGElement || el.tagName === "svg") {
					return selection;
				} else {
					return selection.append("svg");
				}
			})(selection);

			svg.classed("d3ez", true)
				.attr("width", width)
				.attr("height", height);

			chart = svg.append("g").classed("chart", true);
		} else {
			chart = selection.select(".chart");
		}

		// Update the chart dimensions and add layer groups
		let layers = ["donut", "donutLabels"];
		chart.classed(classed, true)
			.attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
			.attr("width", chartW)
			.attr("height", chartH)
			.selectAll("g")
			.data(layers)
			.enter()
			.append("g")
			.attr("class", function(d) { return d; });

		selection.each(function(data) {
			// Initialise Data
			init(data);

			// Donut Slices
			let donutChart = component.donut()
				.radius(radius)
				.innerRadius(innerRadius)
				.colorScale(colorScale)
				.dispatch(dispatch);

			chart.select(".donut")
				.datum(data)
				.call(donutChart);

			// Donut Labels
			let donutLabels = component.donutLabels()
				.radius(radius)
				.innerRadius(innerRadius);

			chart.select(".donutLabels")
				.datum(data)
				.call(donutLabels);
		});
	}

	/**
	 * Width Getter / Setter
	 *
	 * @param {number} _ - Width in px.
	 * @returns {*}
	 */
	my.width = function(_) {
		if (!arguments.length) return width;
		width = _;
		return this;
	};

	/**
	 * Height Getter / Setter
	 *
	 * @param {number} _ - Height in px.
	 * @returns {*}
	 */
	my.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		return this;
	};

	/**
	 * Margin Getter / Setter
	 *
	 * @param {number} _ - Margin in px.
	 * @returns {*}
	 */
	my.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return this;
	};

	/**
	 * Radius Getter / Setter
	 *
	 * @param {number} _ - Radius in px.
	 * @returns {*}
	 */
	my.radius = function(_) {
		if (!arguments.length) return radius;
		radius = _;
		return this;
	};

	/**
	 * Inner Radius Getter / Setter
	 *
	 * @param {number} _ - Inner radius in px.
	 * @returns {*}
	 */
	my.innerRadius = function(_) {
		if (!arguments.length) return innerRadius;
		innerRadius = _;
		return this;
	};

	/**
	 * Colors Getter / Setter
	 *
	 * @param {Array} _ - Array of colours used by color scale.
	 * @returns {*}
	 */
	my.colors = function(_) {
		if (!arguments.length) return colors;
		colors = _;
		return this;
	};

	/**
	 * Color Scale Getter / Setter
	 *
	 * @param {d3.scale} _ - D3 color scale.
	 * @returns {*}
	 */
	my.colorScale = function(_) {
		if (!arguments.length) return colorScale;
		colorScale = _;
		return this;
	};

	/**
	 * Transition Getter / Setter
	 *
	 * @param {d3.transition} _ - D3 transition style.
	 * @returns {*}
	 */
	my.transition = function(_) {
		if (!arguments.length) return transition;
		transition = _;
		return this;
	};

	/**
	 * Dispatch Getter / Setter
	 *
	 * @param {d3.dispatch} _ - Dispatch event handler.
	 * @returns {*}
	 */
	my.dispatch = function(_) {
		if (!arguments.length) return dispatch();
		dispatch = _;
		return this;
	};

	/**
	 * Dispatch On Getter
	 *
	 * @returns {*}
	 */
	my.on = function() {
		let value = dispatch.on.apply(dispatch, arguments);
		return value === dispatch ? my : value;
	};

	return my;
}
