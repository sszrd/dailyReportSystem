import React, { FC, ReactElement, useEffect, useState } from "react";
import { Table, Tag, Popconfirm } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { ITeam, IApplication } from "../../constant/typings";

const { ipcRenderer } = window.require("electron");

const Application: FC = (): ReactElement => {
    const navigate = useNavigate();
    const [team, setTeam] = useState<ITeam>(null);
    const [applications, setApplications] = useState<IApplication[]>([]);

    const teamId = Number(localStorage.getItem("teamId"));

    const handleRefuse = async (applicationId: number) => {
        const response = await ipcRenderer.invoke("delete", `/applications/${applicationId}`, localStorage.getItem("token"));
        if (response.code === 200) {
            setApplications(applications.filter(application => application.id !== applicationId));
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    const handlePass = async (applicationId: number, userId: number) => {
        const response = await ipcRenderer.invoke("delete", `/applications/${applicationId}`, localStorage.getItem("token"));
        if (response.code === 200) {
            const response = await ipcRenderer.invoke("patch", `/users/${userId}`, { teamId }, localStorage.getItem("token"));
            if (response.code === 200) {
                setApplications(applications.filter(application => application.id !== applicationId));
            }
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    useEffect(() => {
        ipcRenderer.invoke("get", "/applications", localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setApplications(response.result);
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }, [])

    useEffect(() => {
        if (teamId) {
            ipcRenderer.invoke("get", `/teams/${teamId}`, localStorage.getItem("token"))
                .then(response => {
                    if (response.code === 200) {
                        setTeam(response.result);
                    } else if (response.code === 401) {
                        localStorage.removeItem("token");
                        ipcRenderer.send("goto login page");
                        navigate("/login");
                    }
                })
        }

    }, [])

    const columns = [
        {
            title: '团队名称',
            dataIndex: ["team", "name"],
            key: "name",
            align: "center" as "center",
            render: (name: string) => <Tag color="blue">{name}</Tag>,
        },
        {
            title: '申请人',
            dataIndex: ["appliedUser", "username"],
            key: "appliedUser.username",
            align: "center" as "center",
            render: (username: string) => <span>{username}</span>,
        },
        {
            title: '审核人',
            dataIndex: ["checkedUser", "username"],
            key: "checkedUser.username",
            align: "center" as "center",
            render: (username: string) => <span>{username}</span>,
        },
        {
            title: '审核状态',
            key: 'type',
            align: "center" as "center",
            render: () => <Tag color="orange">审核中</Tag>
        },
        {
            title: '操作',
            key: 'operation',
            align: "center" as "center",
            render: (application: IApplication) => team ? (
                <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <Popconfirm
                        title="确定要通过该用户的申请吗?"
                        onConfirm={() => handlePass(application.id, application.appliedBy)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <CheckCircleTwoTone />
                    </Popconfirm>
                    <Popconfirm
                        title="确定要拒绝该用户的申请吗?"
                        onConfirm={() => handleRefuse(application.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <CloseCircleTwoTone />
                    </Popconfirm>
                </div >
            ) :
                <Popconfirm
                    title="确定要撤销该申请吗?"
                    onConfirm={() => handleRefuse(application.id)}
                    okText="确定"
                    cancelText="取消"
                >
                    <CloseCircleTwoTone />
                </Popconfirm>
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={applications}
            rowKey={(application: IApplication) => application.id}
        />
    )
}

export default Application;