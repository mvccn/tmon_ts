import { functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { group } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import {
    CircleMarker,
    Square,
    Triangle,
} from "react-financial-charts";
const SELL_COLOR = '#ec3939';
const BUY_COLOR = '#3981ec';

export interface OrderSeriesProps {
    /**
     * A Marker to draw.
     */
    readonly marker?: any;
    /**
     * Given the data point return a Marker.
     */
    readonly markerProvider?: (datum: any) => any;
    /**
     * Props to pass to the marker.
     */
    readonly markerProps?: object;
    /**
     * Accessor for y value.
     */
    readonly yAccessor: (data: any) => number | undefined;
}

export class OrderSeries extends React.Component<OrderSeriesProps> {
    public static defaultProps = {
        marker: Triangle,
        yAccessor: (d: any) => (d.order ? d.order[0].price : undefined),
    };


    public render() {
        return <GenericChartComponent canvasDraw={this.drawOnCanvas} canvasToDraw={getAxisCanvas} drawOn={["pan"]} />;
    }

    /* implement own drawOnCanvas */
    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: {
        xAccessor: (data: any) => number | Date;
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
        chartConfig: any;
        plotData: any[];
    }) => {
        const points = this.getPoints(moreProps);
        points.forEach((point) => {
            // const { marker } = point;
            // marker.drawOnCanvas({ ...marker.defaultProps, ...this.props.markerProps }, point, ctx);
            // ctx.fillStyle = "green";
            if(point.type=='order'){
                this.drawBuySell(ctx, point.x, point.y, 10, point.side);
            }else if(point.type=='trade'){
                this.drawTrade(ctx, point.x, point.y, 10, point.side, point.price);
            }
        });

    }

    private readonly drawBuySell = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, side: string) => {
        let height = width / 3;
        if (side == 'BUY') {
            ctx.strokeStyle = BUY_COLOR;
            ctx.fillStyle = BUY_COLOR;
        } else {
            ctx.strokeStyle = SELL_COLOR;
            ctx.fillStyle = SELL_COLOR;
            height = -height;
        }
        ctx.beginPath();
        ctx.moveTo(x, y); // Top vertex
        ctx.lineTo(x - width / 2, y + height); // Bottom left vertex
        ctx.lineTo(x + width / 2, y + height); // Bottom right vertex
        ctx.closePath();
        // You can use fill() or stroke() depending on whether you want the triangle filled or just outlined.
        ctx.fill(); // Fills the triangle
        // ctx.fillText("buy",x,y);
        // ctx.fillRect(x,y,5,2);
        // ctx.stroke(); // Only outlines the triangle
    }

    private readonly drawTrade = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, side: string, price: number) => {
        // let height = direction=='up'? width / 2: -width / 2;
        let height = width / 3;
        if(price ==0){
            ctx.fillStyle = BUY_COLOR;
            ctx.fillText("close",x,y);
        }else if (side == 'BUY') {
            ctx.strokeStyle = BUY_COLOR;
            ctx.fillStyle = BUY_COLOR;
            ctx.fillText("B",x,y);
        } else {
            ctx.strokeStyle = SELL_COLOR;
            ctx.fillStyle = SELL_COLOR;
            // height = -height;
            ctx.fillText("S",x,y);
        }
    }



    private readonly getPoints = (moreProps: {
        xAccessor: (data: any) => number | Date;
        xScale: ScaleContinuousNumeric<number, number> | ScaleTime<number, number>;
        chartConfig: any;
        plotData: any[];
    }) => {
        const { yAccessor, markerProvider, markerProps } = this.props;

        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        return plotData
            .map((d: any) => {
                // const yValue = yAccessor(d);
                const yValue = d.order;
                if (yValue === undefined) {
                    return undefined;
                }
                const xValue = xAccessor(d);
                const x = xScale(xValue);
    
                return yValue.map(
                    (order: any) => {
                        // if (order.type == 'trade'){
                        //     console.log("trade: ", order.price)
                        // }
                        return {
                            x: x,
                            y: yScale(order.price),
                            side: order.side,
                            type: order.type,
                            quantity: order.quantity,
                        }
                    })
            })
            .filter((d) => (d !== undefined))
            .map((d) => (d!))
            .flat()


        }
    }