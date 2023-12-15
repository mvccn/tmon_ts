import { functor, getAxisCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { group } from "d3-array";
import { ScaleContinuousNumeric, ScaleTime } from "d3-scale";
import * as React from "react";
import {
    CircleMarker,
    Square,
    Triangle,
} from "react-financial-charts";

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
            this.drawBuySell(ctx, point.x, point.y, 10, point.side);
        });

    }

    private readonly drawBuySell = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, side: string) => {
        // let height = direction=='up'? width / 2: -width / 2;
        let height = width / 3;
        if (side == 'BUY') {
            ctx.strokeStyle = "green";
        } else {
            ctx.strokeStyle = "red";
            height = -height;
        }
        ctx.beginPath();
        ctx.moveTo(x, y); // Top vertex
        ctx.lineTo(x - width / 2, y + height); // Bottom left vertex
        ctx.lineTo(x + width / 2, y + height); // Bottom right vertex
        ctx.closePath();
        // You can use fill() or stroke() depending on whether you want the triangle filled or just outlined.
        ctx.stroke(); // Fills the triangle
        // ctx.stroke(); // Only outlines the triangle
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
                        return {
                            x: x,
                            y: yScale(order.price),
                            side: order.side,
                        }
                    })
            })
            .filter((d) => (d !== undefined))
            .map((d) => (d!))
            .flat()


    }

    private readonly drawOnCanvas1 = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        const points = this.getMarkers(moreProps);

        const { markerProps } = this.props;

        const nest = group(
            points,
            (d) => d.fillStyle,
            (d) => d.strokeStyle,
        );

        nest.forEach((fillValues, fillKey) => {
            if (fillKey !== "none") {
                ctx.fillStyle = fillKey;
            }

            fillValues.forEach((strokeValues) => {
                strokeValues.forEach((point) => {
                    const { marker } = point;
                    marker.drawOnCanvas({ ...marker.defaultProps, ...markerProps, fillStyle: fillKey }, point, ctx);
                });
            });
        });
    };

    private readonly getMarkers = (moreProps: {
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

        let { marker: Marker } = this.props;
        if (!(markerProvider || Marker)) {
            throw new Error("required prop, either marker or markerProvider missing");
        }

        return plotData
            .map((d: any) => {
                const yValue = yAccessor(d);
                if (yValue === undefined) {
                    return undefined;
                }

                const xValue = xAccessor(d);

                if (markerProvider) {
                    Marker = markerProvider(d);
                }

                const mProps = { ...Marker.defaultProps, ...markerProps };

                const fill = functor(mProps.fillStyle);
                const stroke = functor(mProps.strokeStyle);

                return {
                    x: xScale(xValue),
                    y: yScale(yValue),
                    fillStyle: fill(d),
                    strokeStyle: stroke(d),
                    datum: d,
                    marker: Marker,
                };
            })
            .filter((marker) => marker !== undefined)
            .map((marker) => marker!);
    };
}
