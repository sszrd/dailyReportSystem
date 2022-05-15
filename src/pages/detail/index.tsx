import { PageHeader, Button, Descriptions } from 'antd';
import { IReport, ITask, ITeam } from '../../constant/typings';
import React, { useEffect, useState } from 'react';
import { FC, ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./index.css";

const { ipcRenderer } = window.require("electron");

interface ITeamReport extends IReport {
    username: string
}

const Detail: FC = (): ReactElement => {
    const navigate = useNavigate();
    const report = useLocation().state as ITeamReport;
    const [task, setTask] = useState<ITask>(null);

    const getTask = async () => {
        if (report.taskId) {
            const response = await ipcRenderer.invoke("get", `/tasks/${report.taskId}`, localStorage.getItem("token"));
            if (response.code === 200) {
                setTask(response.result);
            } else if (response.code === 401) {
                localStorage.removeItem("token");
                ipcRenderer.send("goto login page");
                navigate("/login");
            }
        }
    }

    useEffect(() => {
        getTask();
    }, [report.taskId])

    const isOwnReport = report.username === localStorage.getItem("username");

    return (
        report &&
        <div className="site-page-header-ghost-wrapper">
            <PageHeader
                ghost={false}
                onBack={() => navigate(-1)}
                title={report.title}
                extra={isOwnReport ? [
                    <Button key="1" type="primary" onClick={() => navigate("/frame/editReport", { state: { report, type: "edit" } })}>
                        编辑
                    </Button>,
                ] : []}
            >
                <Descriptions size="small" column={4} bordered>
                    <Descriptions.Item label="作者" span={2}>{report.username}</Descriptions.Item>
                    <Descriptions.Item label="创建时间" span={2}>
                        {new Date(new Date(report.createdAt).getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10)}
                    </Descriptions.Item>
                    <Descriptions.Item label="用时" span={2}>{`${report.time}h`}</Descriptions.Item>
                    <Descriptions.Item label="所属任务" span={2}>{task?.target}</Descriptions.Item>
                    <Descriptions.Item label="已完成" span={4}>{report.finish}</Descriptions.Item>
                    <Descriptions.Item label="未完成" span={4}>{report.unfinish}</Descriptions.Item>
                    <Descriptions.Item label="总结" span={4}>{report.thinking}</Descriptions.Item>
                </Descriptions>
            </PageHeader>
        </div>
    )
};

export default Detail;