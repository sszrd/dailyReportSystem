import * as echarts from 'echarts';
import React, { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { Button, Descriptions, Divider, PageHeader, Pagination, Select } from 'antd';
import { IReport, ITeam, ITask } from "../../constant/typings";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

interface ITeamReport extends IReport {
    username: string
}

const Statistics: FC = (): ReactElement => {
    const main = useRef<HTMLDivElement>(null);
    const [reports, setReports] = useState<ITeamReport[]>([]);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [selectTaskId, setSelectTaskId] = useState<number>(undefined);
    const [curPage, setCurPage] = useState(1);
    const [curMemberId, setCurMemberId] = useState<number>(undefined);
    const [team, setTeam] = useState<ITeam>(null);
    const navigate = useNavigate();
    let mainInstance = null;

    const isManager = team && team.teamManager.username === localStorage.getItem("username");

    const getAllTasks = async () => {
        let response;
        if (isManager) {
            response = await ipcRenderer.invoke("get", "/tasks/createdBy", localStorage.getItem("token"));
        } else {
            response = await ipcRenderer.invoke("get", "/tasks/executedBy", localStorage.getItem("token"));
        }
        if (response && response.code === 200) {
            setTasks(response.result);
        } else if (response && response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    const getTeam = async () => {
        const response = await ipcRenderer.invoke("get", `/teams/${localStorage.getItem("teamId")}`, localStorage.getItem("token"))
        if (response.code === 200) {
            setTeam(response.result);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    const getAllReports = async () => {
        if (!isManager) {
            const response = await ipcRenderer.invoke("get", "/reports", localStorage.getItem("token"));
            if (response.code === 200) {
                setReports(Object.values(response.result));
            } else if (response.code === 401) {
                localStorage.removeItem("token");
                ipcRenderer.send("goto login page");
                navigate("/login");
            }
        } else {
            const teamReports: ITeamReport[] = [];
            team.teamMembers.forEach((member) => {
                member.reports.forEach((report) => {
                    teamReports.push({ ...report, username: member.username });
                })
            })
            setReports(teamReports);
        }
    }

    useEffect(() => {
        getAllReports();
        getAllTasks();
    }, [isManager, team])

    useEffect(() => {
        getTeam();
    }, [])

    const weekDate: string[] = useMemo(() => {
        const week = [];
        for (let i = 0; i < 7; i++) {
            const time = new Date().getTime() - i * 1000 * 60 * 60 * 24 + 8 * 1000 * 60 * 60;
            week.unshift(new Date(time).toJSON().substring(0, 10));
        }
        return week;
    }, [])

    const progress: number = useMemo(() => {
        if (!selectTaskId) {
            return 0;
        }
        const selectTask: ITask = tasks.filter(task => task.id === selectTaskId)[0];
        const items = selectTask.items;
        if (!items.length) {
            return 0;
        }
        return items.reduce((total, item) => item.isFinish ? 1 + total : total, 0) / items.length;
    }, [selectTaskId]);

    const totalTime: number = useMemo(() => {
        if (!selectTaskId) {
            return 0;
        }
        const selectTask: ITask = tasks.filter(task => task.id === selectTaskId)[0];
        const reports = selectTask.reports;
        return reports.reduce((total, report) => total + report.time, 0);
    }, [selectTaskId]);

    const willTime: number = useMemo(() => {
        if (!selectTaskId) {
            return 0;
        }
        const selectTask: ITask = tasks.filter(task => task.id === selectTaskId)[0];
        if (progress === 0 || totalTime === 0) {
            return (new Date(selectTask?.deadline).getTime() - new Date(selectTask?.startAt).getTime()) / 1000 / 24 / 60 / 60 * 8;
        }
        return totalTime / progress - totalTime;
    }, [totalTime, progress, selectTaskId])

    const Values: { weekBarValue: number[], timeLineValue: number[] } = useMemo(() => {
        const weekBarValue = new Array(7).fill(0);
        const timeLineValue = new Array(7).fill(0);
        if (isManager && !curMemberId) {
            return {
                weekBarValue,
                timeLineValue
            }
        }
        const _reports = isManager ? team.teamMembers.filter(member => member.id === curMemberId)[0].reports : reports;
        _reports.forEach(report => {
            if (weekDate.includes(new Date(new Date(report.createdAt).getTime() + 8 * 1000 * 60 * 60).toJSON().substring(0, 10))) {
                weekBarValue[
                    weekDate.indexOf(new Date(new Date(report.createdAt).getTime() + 8 * 1000 * 60 * 60).toJSON().substring(0, 10))
                ] = 1;
                timeLineValue[
                    weekDate.indexOf(new Date(new Date(report.createdAt).getTime() + 8 * 1000 * 60 * 60).toJSON().substring(0, 10))
                ] = report.time;
            }
        })
        return {
            weekBarValue,
            timeLineValue,
        }
    }, [reports, weekDate, tasks, isManager, curMemberId]);

    const weekBar = {
        title: {
            text: '近一周打卡情况',
            left: 'center'
        },
        xAxis: {
            show: true,
            type: 'category',
            data: ['六天前', '五天前', '四天前', '三天前', '两天前', '昨日', '今日']
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
            data: ['六天前', '五天前', '四天前', '三天前', '两天前', '昨日', '今日']
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

    const taskProgress = {
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
                    { value: progress, name: '已完成' },
                    { value: 1 - progress, name: '未完成' },
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
        setCurPage(value);
    }

    const renderChart = () => {
        const myChart = echarts.getInstanceByDom(main.current);
        if (myChart) {
            mainInstance = myChart;
        }
        else {
            mainInstance = echarts.init(main.current);
        }
        mainInstance.clear();
        if (isManager && !curMemberId) {
            return;
        }
        switch (curPage) {
            case 1:
                mainInstance.setOption(weekBar);
                break;
            case 2:
                mainInstance.setOption(timeLine);
                break;
            case 3:
                if (!selectTaskId) {
                    return;
                }
                mainInstance.setOption(taskProgress);
                break;
            default:
                mainInstance.setOption(weekBar);
                break;
        }
    };

    const renderHeader = () => {
        if (isManager) {
            return <>
                <Select style={{ width: 120, marginRight: "10px" }} onChange={(value) => setCurMemberId(value)} placeholder="选择成员">
                    {team.teamMembers.filter(member => member.username !== localStorage.getItem("username"))
                        .map(member =>
                            <Select.Option value={member.id} key={member.id}>
                                {member.username}
                            </Select.Option>)
                    }
                </Select>
                {curPage === 3 &&
                    <Select style={{ width: 120 }} onChange={(value) => setSelectTaskId(value)} placeholder="选择任务">
                        {tasks.map(task => <Select.Option value={task.id} key={task.id}>{task.target}</Select.Option>)}
                    </Select>}
                <Divider />
            </>
        }
        return curPage === 3 &&
            <>
                <Select style={{ width: 120 }} onChange={(value) => setSelectTaskId(value)} placeholder="选择任务">
                    {tasks.map(task => <Select.Option value={task.id} key={task.id}>{task.target}</Select.Option>)}
                </Select>
                <Divider />
            </>
    }

    useEffect(() => {
        setTimeout(() => renderChart(), 20)
    }, [weekBar]);

    return (
        <>
            {renderHeader()}
            <div>
                <div style={{ height: 600 }} ref={main} />
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination total={30} onChange={handleChange} current={curPage} />
                </div>
            </div>
        </>
    );
}

export default Statistics;