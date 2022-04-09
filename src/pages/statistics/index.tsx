import "./index.css";
import * as echarts from 'echarts';
import React, { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from 'antd';
import { IReport } from "../../constant/typings";
import { IPlan } from "../../constant/typings";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

const Statistics: FC = (): ReactElement => {
    const main = useRef<HTMLDivElement>(null);
    const [reports, setReports] = useState<IReport[]>([]);
    const [plans, setPlans] = useState<IPlan[]>([]);
    const navigate = useNavigate();
    let mainInstance = null;

    const weekDate: string[] = useMemo(() => {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const time = new Date().getTime() - i * 1000 * 60 * 60 * 24;
            week.push(new Date(time).toJSON().substring(0, 10));
        }
        return week;
    }, [])

    const curPlan: IPlan = useMemo(() => plans.filter(plan =>
        new Date(plan.deadline).getTime() >= new Date().getTime() && new Date(plan.startAt).getTime() <= new Date().getTime()
    )[0], [plans])

    const progressPieValue: number[] = useMemo(() => [curPlan?.progress, 1 - curPlan?.progress], [curPlan]);
    const totalTime: number = useMemo(() => curPlan?.totalTime, [curPlan]);
    const willTime: number = useMemo(() => {
        if (curPlan?.totalTime === 0 || curPlan?.progress === 0) {
            return ((new Date(curPlan.deadline).getTime() - new Date(curPlan.startAt).getTime()) / (24 * 60 * 60 * 1000)) * 8;
        }
        return curPlan?.totalTime / curPlan?.progress;
    }, [totalTime, curPlan]);

    const Values: { weekBarValue: number[], timeLineValue: number[], percentLineValue: number[] } = useMemo(() => {
        const weekBarValue = new Array(7).fill(0);
        const timeLineValue = new Array(7).fill(0);
        const percentLineValue = new Array(7).fill(0);
        reports.forEach(report => {
            if (weekDate.includes(report.createdAt.substring(0, 10))) {
                weekBarValue[weekDate.indexOf(report.createdAt.substring(0, 10))] = 1;
                timeLineValue[weekDate.indexOf(report.createdAt.substring(0, 10))] = report.time;
                percentLineValue[weekDate.indexOf(report.createdAt.substring(0, 10))] = report.percent;
            }
        })
        return {
            weekBarValue,
            timeLineValue,
            percentLineValue
        }
    }, [reports, weekDate]);

    const weekBar = {
        title: {
            text: '近一周打卡情况',
            left: 'center'
        },
        xAxis: {
            show: true,
            type: 'category',
            data: ['今天', '一天前', '两天前', '三天前', '四天前', '五天前', '六天前']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: Values.weekBarValue,
                type: 'bar'
            }
        ]
    };

    const timeLine = {
        title: {
            text: '近一周时长趋势',
            left: 'center'
        },
        xAxis: {
            show: true,
            type: 'category',
            data: ['今天', '一天前', '两天前', '三天前', '四天前', '五天前', '六天前']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: Values.timeLineValue,
                type: 'line'
            }
        ]
    };

    const percentLine = {
        title: {
            text: '近一周任务完成率',
            left: 'center'
        },
        xAxis: {
            show: true,
            type: 'category',
            data: ['今天', '一天前', '两天前', '三天前', '四天前', '五天前', '六天前']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: Values.percentLineValue,
                type: 'line'
            }
        ]
    }

    const planProgress = {
        title: {
            text: '计划预警',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        xAxis: {
            show: false
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                center: ['25%', '50%'],
                data: [
                    { value: progressPieValue[0], name: '已完成' },
                    { value: progressPieValue[1], name: '未完成' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            {
                type: 'pie',
                radius: '50%',
                center: ['75%', '50%'],
                data: [
                    { value: totalTime, name: '已用时' },
                    { value: willTime, name: '预计还需用时' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    const handleChange = (value: number) => {
        switch (value) {
            case 1:
                renderChart(weekBar);
                break;
            case 2:
                renderChart(timeLine);
                break;
            case 3:
                renderChart(percentLine);
                break;
            case 4:
                renderChart(planProgress);
                break;
            default:
                renderChart(weekBar);
                break;
        }
    }

    const renderChart = (oOption: any) => {
        const myChart = echarts.getInstanceByDom(main.current);
        if (myChart) {
            mainInstance = myChart;
        }
        else {
            mainInstance = echarts.init(main.current);
        }
        mainInstance.clear();
        mainInstance.setOption(oOption);
    };

    useEffect(() => {
        setTimeout(() => renderChart(weekBar), 20)
    }, [weekBar]);

    useEffect(() => {
        ipcRenderer.invoke("get", "/reports", localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setReports(Object.values(response.result));
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
        ipcRenderer.invoke("get", "/plans", localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setPlans(Object.values(response.result));
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }, [])

    return (
        <div>
            <div style={{ height: 600 }} ref={main} />
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Pagination defaultCurrent={1} total={40} onChange={handleChange} />
            </div>
        </div>
    );
}

export default Statistics;