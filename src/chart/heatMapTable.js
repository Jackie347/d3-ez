import * as d3 from "d3";
import palette from "../palette";
import dataTransform from "../dataTransform";
import component from "../component";

/**
 * Heat Map (also called: Heat Table; Density Table; Heat Map)
 *
 * @module
 * @see http://datavizproject.com/data-type/heat-map/
 */
export default function() {

	/* Default Properties */
	let svg;
	let chart;
	let classed = "heatMapTable";
	let width = 400;
	let height = 300;
	let margin = { top: 50, right: 20, bottom: 20, left: 50 };
	let transition = { ease: d3.easeBounce, duration: 500 };
	let colors = ["#D34152", "#f4bc71", "#FBF6C4", "#9bcf95", "#398abb"];
	let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");

	/* Chart Dimensions */
	let chartW;
	let chartH;

	/* Scales */
	let xScale;
	let yScale;
	let colorScale;

	/* Other Customisation Options */
	let thresholds;

	/**
	 * Initialise Data and Scales
	 *
	 * @private
	 * @param {Array} data - Chart data.
	 */
	function init(data) {
		chartW = width - margin.left - margin.right;
		chartH = height - margin.top - margin.bottom;

		// Slice Data, calculate totals, max etc.
		let dataSummary = dataTransform(data).summary();
		let categoryNames = dataSummary.rowKeys;
		let seriesNames = dataSummary.columnKeys;


		// If thresholds values are not set attempt to auto-calculate the thresholds.
		if (!thresholds) {
			thresholds = dataSummary.thresholds;
		}

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = (typeof colorScale === "undefined") ?
			d3.scaleThreshold().domain(thresholds).range(colors) :
			colorScale;

		// X & Y Scales
		xScale = d3.scaleBand()
			.domain(seriesNames)
			.range([0, chartW])
			.padding(0.1);

		yScale = d3.scaleBand()
			.domain(categoryNames)
			.range([0, chartH])
			.padding(0.1);
	}

	/**
	 * Constructor
	 *
	 * @constructor
	 * @alias heatMapTable
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
		let layers = ["heatRowGroups", "xAxis axis", "yAxis axis"];
		chart.classed(classed, true)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
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

			// Heat Map Rows
			let heatMapRow = component.heatMapRow()
				.width(chartW)
				.height(chartH)
				.colorScale(colorScale)
				.xScale(xScale)
				.yScale(yScale)
				.dispatch(dispatch)
				.thresholds(thresholds);

			// Create Series Group
			let seriesGroup = chart.select(".heatRowGroups")
				.selectAll(".seriesGroup")
				.data(data);

			seriesGroup.enter().append("g")
				.attr("class", "seriesGroup")
				.attr("transform", function(d) { return "translate(0, " + yScale(d.key) + ")"; })
				.merge(seriesGroup)
				.call(heatMapRow);

			seriesGroup.exit()
				.remove();

			// X Axis
			let xAxis = d3.axisTop(xScale);

			chart.select(".xAxis")
				.call(xAxis)
				.selectAll("text")
				.attr("y", 0)
				.attr("x", -8)
				.attr("transform", "rotate(60)")
				.style("text-anchor", "end");

			// Y Axis
			let yAxis = d3.axisLeft(yScale);

			chart.select(".yAxis")
				.call(yAxis);
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
	 * Thresholds Getter / Setter
	 *
	 * @param {Array} _ - Array of thresholds.
	 * @returns {*}
	 */
	my.thresholds = function(_) {
		if (!arguments.length) return thresholds;
		thresholds = _;
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
