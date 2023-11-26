
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import React from "react";
import PropTypes from "prop-types";

import { 
	ChartCanvas, 
	Chart,
	BarSeries,
	AreaSeries,
	CandlestickSeries,
	LineSeries,
	XAxis, 
	YAxis,
	CrossHairCursor,
	EdgeIndicator,
	CurrentCoordinate,
	MouseCoordinateX,
	MouseCoordinateY,
	discontinuousTimeScaleProviderBuilder,
	OHLCTooltip,
	ema, sma, macd,
} from "react-financial-charts";

import { fitWidth } from "react-stockcharts/lib/helper";
import {get_series, parseTick } from "../data/data"

function getMaxUndefined(calculators) {
	return calculators.map(each => each.undefinedLength()).reduce((a, b) => Math.max(a, b));
}
const LENGTH_TO_SHOW = 200;

const macdAppearance = {
	stroke: {
		macd: "#FF0000",
		signal: "#00F300",
	},
	fill: {
		divergence: "#4682B4"
	},
};

class CandleStickChartPanToLoadMore extends React.Component {
	constructor(props) {
		super(props);
		const { data: inputData } = props;

		const ema26 = ema()
			.id(0)
			.options({ windowSize: 26 })
			.merge((d, c) => {d.ema26 = c;})
			.accessor(d => d.ema26);

		const ema12 = ema()
			.id(1)
			.options({ windowSize: 12 })
			.merge((d, c) => {d.ema12 = c;})
			.accessor(d => d.ema12);

		const macdCalculator = macd()
			.options({
				fast: 12,
				slow: 26,
				signal: 9,
			})
			.merge((d, c) => {d.macd = c;})
			.accessor(d => d.macd);

		const smaVolume50 = sma()
			.id(3)
			.options({
				windowSize: 50,
				sourcePath: "volume",
			})
			.merge((d, c) => {d.smaVolume50 = c;})
			.accessor(d => d.smaVolume50);

		const maxWindowSize = getMaxUndefined([ema26,
			ema12,
			macdCalculator,
			smaVolume50
		]);
		/* SERVER - START */
		const dataToCalculate = inputData.slice(-LENGTH_TO_SHOW - maxWindowSize);

		const calculatedData = ema26(ema12(macdCalculator(smaVolume50(dataToCalculate))));
		const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();

		// console.log(inputData.length, dataToCalculate.length, maxWindowSize)
		const { index } = indexCalculator(calculatedData);
		/* SERVER - END */

		const xScaleProvider = discontinuousTimeScaleProviderBuilder()
			.withIndex(index);
		const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData.slice(-LENGTH_TO_SHOW));

		// console.log(head(linearData), last(linearData))
		// console.log(linearData.length)

		this.state = {
			ema26,
			ema12,
			macdCalculator,
			smaVolume50,
			linearData,
			data: linearData,
			xScale,
            xAccessor, 
            displayXAccessor,
            showEMA26:true,
		};
        this.handleDownloadMore = this.handleDownloadMore.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);

    }
    onKeyPress(e) {
        const keyCode = e.which;
        console.log("keycode pressed:"+keyCode);
        switch (keyCode) {
            case 32: {
                const{ updateInterval}=this.props;
                this.interval = setInterval(this.update_lastbar, updateInterval);
                break;
            }
        }
    }

	handleDownloadMore(start, end) {
        //stop the update as soon as we load more data. 
		if (this.interval) clearInterval(this.interval);
		if (this.tickInterval) clearInterval(this.tickInterval);

		if (Math.ceil(start) === end) return;
		// console.log("rows to download", rowsToDownload, start, end)
		const { data: prevData, ema26, ema12, macdCalculator, smaVolume50 } = this.state;
		//const { data: inputData } = this.props;


		//if (inputData.length === prevData.length) return;

		const rowsToDownload = end - Math.ceil(start);

		const maxWindowSize = getMaxUndefined([ema26,
			ema12,
			macdCalculator,
			smaVolume50
		]);

		/* SERVER - START */
		const {frequency,bufferSize, security_code} = this.props;
		const End_date = prevData[0].date;
		const key= security_code+":"+frequency
		get_series(key, rowsToDownload, undefined ,End_date).then(newdata => {
			const dataToCalculate = newdata.slice(0,-1);
			console.log(newdata);
            //    .slice(-rowsToDownload - maxWindowSize - prevData.length, - prevData.length);

            const calculatedData = ema26(ema12(macdCalculator(smaVolume50(dataToCalculate))));
            // const indexCalculator = discontinuousTimeScaleProviderBuilder()
            //     .initialIndex(Math.ceil(start))
            //     .indexCalculator();
            // const { index } = indexCalculator(
            //     calculatedData
            //         .slice(-rowsToDownload)
            //         .concat(prevData));
            // /* SERVER - END */

            // const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            //     .initialIndex(Math.ceil(start))
            //     .withIndex(index);

            // const { data: linearData, 
            //         xScale, 
            //         xAccessor, 
            //         displayXAccessor } = xScaleProvider(calculatedData.slice(-rowsToDownload).concat(prevData));
            // console.log(linearData);
            // console.log(xAccessor);
            // // console.log(linearData.length)
           
            // this.setState({
            //     data: linearData,
            //     xScale,
            //     xAccessor,
            //     displayXAccessor,
            // });
            this.updateData(calculatedData
                .slice(-rowsToDownload)
                .concat(prevData),
                Math.ceil(start) 
            )
        
        });
    }

    updateData(newdata, initial_index){
        const indexCalculator = discontinuousTimeScaleProviderBuilder()
            .initialIndex(initial_index)
            .indexCalculator();
        const { index } = indexCalculator (newdata);

        const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            .initialIndex(initial_index)
            .withIndex(index);

        const { data: linearData, 
                xScale, 
                xAccessor, 
                displayXAccessor } = xScaleProvider(newdata);
        //console.log(linearData);
        //console.log(xAccessor);
        // console.log(linearData.length)

        this.setState({
            data: linearData,
            xScale,
            xAccessor,
            displayXAccessor,
        });
    }

    
	componentDidMount() {
		console.log('chart loadmore didmount called ')
		const { updateInterval, updateTickInterval } = this.props;

		this.interval = setInterval( this.update_lastbar, updateInterval);
		this.tickInterval = setInterval (this.update_lastTick, updateTickInterval);
		document.addEventListener("keyup", this.onKeyPress); 

	}

	componentWillUnmount() {
		if (this.interval) clearInterval(this.interval);
		if (this.tickInterval) clearInterval(this.tickInterval);
        document.removeEventListener("keyup", this.onKeyPress);
	}


	update_lastbar=()=>{
		console.log('update last bar')
		const {frequency,bufferSize, security_code} = this.props;
		get_series(security_code+":"+frequency, bufferSize)
		.then(data=>{
//			console.log(data);
			if(data !== undefined && data !== null){
				//console.log(ndata);
				this.setState((state)=>{
                    /* check if the latest data retrieved is the same with the last one . */  
                    var newdata=state.data.slice();
                    if((newdata[newdata.length-1].date - data[0].date) === 0){
                        console.log("last update: same time bar")
                        newdata.pop();
                    }
                    newdata.push(data[0]);

                    /* reset data start */
                    // const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();
                    // const { index } = indexCalculator(newdata);
                    // const xScaleProvider = discontinuousTimeScaleProviderBuilder()
                    //     .withIndex(index);;
                    // const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(newdata);
                    // /* reset data stop */
                    // return {data: linearData, xScale, xAccessor, displayXAccessor};
                    this.updateData(newdata,0)
				});
			}else{
				console.error('update request time out')
			}
		});
	}
	
	update_lastTick=()=>{
		// console.log('update tick')
		const {security_code} = this.props;
		get_series(security_code+":ticks",1, undefined, undefined, parseTick)
		.then(data=>{
			//console.info(data[0]);
			if(data !== undefined && data !== null){
				//console.log(ndata);
				this.setState((state)=>{
					var pre_data = state.data.slice();
					var lastbar = pre_data.pop();
					//console.log(lastbar);
					lastbar.close = data[0].current; 					
                    pre_data.push(lastbar);
                    this.updateData(pre_data,0)
				});
			}else{
				console.error('update tick timeout ')
			}
		});
    }
	
    drawEMA26=() => {
        const {showEMA26, ema26}=this.state;
        if(showEMA26){
            return  <LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()}/>
        }
	}

	
	/* this will be called twice since this set state and trigger another call */ 
	componentDidUpdate(prevProps,prevState, snapshot) {
		// console.log('did update called')
		const {frequency, bufferSize, security_code} = this.props
		//console.log(prevProps.frequency, frequency)
		if(prevProps.frequency !== frequency) {
			console.log("update frequency")
			get_series(security_code+":"+frequency, bufferSize).then(data => {
				console.log("update initial chart data:");
				console.log(data);
				if (data !== undefined & data !== null) {
					this.updateData(data, 0)
				} else {
					console.error("Failed to get new data when freqency change ")
				}
			})
		} else {
			return null;
		}
	}

	render() {
		const { type, width, ratio, height, volume_chart_height} = this.props;
		const { data, ema26, ema12, macdCalculator, smaVolume50, xScale, xAccessor, displayXAccessor, showEMA26} = this.state;


		/*---display settings ---*/
		const margin = { left: 50, right: 65, top: 20, bottom: 30 };

		const gridHeight = height - margin.top - margin.bottom;
		const gridWidth = width - margin.left - margin.right;

		const showGrid = true;
		const yGrid = showGrid ? { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.1 } : {};
		const xGrid = showGrid ? { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1 } : {};

		/*---color-- */
		const clr_backdrop= "#0b0e11"
		const clr_up="#ea007a"
		const clr_down="#70a800"
		const clr_text= "#d4d4d4" // "#cacfdf"
		const clr_highlight_text = "#ffffff"
		const clr_thin_line = "#484e5b" 
		const clr_line1="#fec200"


        //console.log('chart render called');
        //console.log(data);
		return (
			<ChartCanvas ratio={ratio} width={width} height={height} margin={margin} 
					type={type}
					seriesName="etf50"
					data={data}
					xScale={xScale} xAccessor={xAccessor} displayXAccessor={displayXAccessor}
					onLoadMore={this.handleDownloadMore} >
				<Chart id={1} height={gridHeight}
						yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
						padding={{ top: 10, bottom: volume_chart_height }}>
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} stroke={clr_highlight_text}   opacity={0.5}/>
					<YAxis axisAt="right" orient="right" ticks={8} stroke={clr_thin_line} tickStroke={clr_highlight_text}  {...yGrid} opacity={.7} />

					<MouseCoordinateY
						at="right"
						orient="right"
						displayFormat={format(".4f")} stroke={clr_highlight_text} fill={clr_backdrop}/>

					<CandlestickSeries 
						stroke={d => d.close > d.open ? clr_up : clr_down}
						wickStroke={d => d.close > d.open ? clr_up : clr_down}
						fill={d => d.close > d.open ? clr_up : clr_down}
						opacity= {1.0} strokeOpacity ={1.0} wickStrokOpacity ={1.0}
					/>
                    {/*
                    <LineSeries yAccessor={ema26.accessor()} stroke={ema26.stroke()}/> 
					<CurrentCoordinate yAccessor={ema26.accessor()} fill={ema26.stroke()} />
                      */}
					<LineSeries yAccessor={ema12.accessor()} stroke={clr_line1}/>
					<CurrentCoordinate yAccessor={ema12.accessor()} fill={clr_line1} />
					{/*last price*/}
					<EdgeIndicator itemType="last" orient="right" edgeAt="right"
						yAccessor={d => d.close} fill={d => d.close > d.open ? clr_up : clr_down}  displayFormat={format(".4f")} stroke={clr_highlight_text}/>

					<OHLCTooltip origin={[0, 0]} xDisplayFormat={timeFormat("%Y/%m/%d %H:%M:%S")} textFill={clr_text} labelFill={clr_text}/> {/* ohlc numbers */}

				</Chart>
				<Chart id={2} height={volume_chart_height}
						yExtents={[d => d.volume, smaVolume50.accessor()]}
						origin={(w, h) => [0, h - volume_chart_height]}>
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")} stroke={clr_thin_line} tickStroke={clr_text} />

					<MouseCoordinateY
						at="left"
						orient="left"
						displayFormat={format(".4s")} />

					<BarSeries yAccessor={d => d.volume} fill={d => d.close > d.open ? clr_up : clr_down} opacity={1.0}/>
					<AreaSeries yAccessor={smaVolume50.accessor()} stroke={smaVolume50.stroke()} fill={smaVolume50.fill()}/>
				</Chart>
				<CrossHairCursor stroke={clr_highlight_text} DisplayFormat={timeFormat("%Y-%m-%d %H:%M:%S")}/>
			</ChartCanvas>
		);
	}
}

/*

*/

CandleStickChartPanToLoadMore.propTypes = {
	frequency: PropTypes.string.isRequired,
	bufferSize: PropTypes.number.isRequired,
	// data: PropTypes.array.isRequired,
    //datasource: PropTypes.string.isRequired,
	width: PropTypes.number.isRequired,
	height: PropTypes.number.isRequired,
	ratio: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
	updateInterval:PropTypes.number.isRequired,
	updateTickInterval:PropTypes.number.isRequired,
	security_code: PropTypes.string.isRequired,

};

CandleStickChartPanToLoadMore.defaultProps = {
    type: "hybrid",
	updateInterval: 60*1000,  //update last bar
	updateTickInterval: 1*1000, 
	security_code: '510050', 
	frequency: '1m',
	bufferSize: 200,
	height: 450,
	volume_chart_height: 100, 
};

CandleStickChartPanToLoadMore = fitWidth(CandleStickChartPanToLoadMore);

export default CandleStickChartPanToLoadMore;
