import "./index.css";
import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { List, Typography, DatePicker, Button } from 'antd';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { IPlan, IReport } from "../../constant/typings";
const { ipcRenderer } = window.require("electron");

const Report: FC = (): ReactElement => {
    const navigate = useNavigate();
    const [allReports, setAllReports] = useState<IReport[]>([]);
    const [reports, setReports] = useState<IReport[]>([]);
    const [plans, setPlans] = useState<IPlan[]>([]);

    useEffect(() => {
        ipcRenderer.invoke("get", "/reports", localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setAllReports(Object.values(response.result));
                    setReports(Object.values(response.result));
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }, []);

    useEffect(() => {
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

    const curPlan: IPlan = useMemo(() => plans?.filter(plan =>
        new Date().getTime() >= new Date(plan.startAt).getTime() &&
        new Date().getTime() <= new Date(plan.deadline).getTime())[0],
        [plans]
    );

    const onChange = (date: any, dateString: any) => {
        if (!dateString) {
            setReports(allReports);
        } else {
            const newReports: IReport[] = allReports.filter((report) => report.createdAt.substring(0, 10) === dateString);
            setReports(newReports);
        }
    }

    const handleEdit = (report: IReport) => {
        navigate("/frame/detail", { state: { type: "edit", report } });
    }

    const handleDelete = (item: IReport) => {
        ipcRenderer.invoke("delete", `/reports/${item.id}`, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setReports(reports.filter(report => report.id !== item.id));
                    ipcRenderer.invoke("patch",
                        `/plans/${curPlan.id}`,
                        { totalTime: curPlan.totalTime - item.time },
                        localStorage.getItem("token")
                    )
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }

    const gotoDetail = () => {
        const report = reports.filter(report => report.createdAt.substring(0, 10) === new Date().toJSON().substring(0, 10))[0];
        if (report) {
            navigate("/frame/detail", { state: { type: "edit", report } });
        } else {
            navigate("/frame/detail", { state: { type: "add" } });
        }
    };

    return (
        <List
            header={
                <div className="report-list-header">
                    <DatePicker onChange={onChange} />
                    <Button type="primary" onClick={gotoDetail}>编辑今日日报</Button>
                </div>
            }
            bordered
            dataSource={reports}
            renderItem={item => (
                <List.Item>
                    <Typography.Text mark>{item.createdAt.substring(0, 10)}</Typography.Text>
                    <span>{item.title}</span>
                    <div className="report-list-button-group">
                        <EditTwoTone onClick={() => handleEdit(item)} />
                        <DeleteTwoTone onClick={() => handleDelete(item)} />
                    </div>
                </List.Item>
            )}
        />
    )
}

export default Report;