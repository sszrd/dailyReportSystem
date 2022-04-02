import "./index.css";
import React, { FC, ReactElement, useEffect, useState } from "react";
import { List, Typography, DatePicker, Button } from 'antd';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { IReport } from "../../constant/typings";
const { ipcRenderer } = window.require("electron");

const Report: FC = (): ReactElement => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<IReport[]>([]);

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
    }, []);

    const onChange = (date: any, dateString: any) => {
        console.log(date, dateString);
    }

    const handleEdit = (report: IReport) => {
        navigate("/frame/detail", { state: { type: "edit", report } });
    }

    const handleDelete = (id: number) => {
        ipcRenderer.invoke("delete", `/reports/${id}`, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setReports(reports.filter(report => report.id !== id));
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
                        <DeleteTwoTone onClick={() => handleDelete(item.id)} />
                    </div>
                </List.Item>
            )}
        />
    )
}

export default Report;