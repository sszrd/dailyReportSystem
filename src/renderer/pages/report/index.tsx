import React, { FC, ReactElement, useEffect, useState } from "react";
import { DatePicker, Button, Space, Table, Tag } from 'antd';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { IReport, ITeam } from "../../../constant/typings";
const { ipcRenderer } = window.require("electron");

interface ITeamReport extends IReport {
    username: string
}

const Report: FC = (): ReactElement => {
    const navigate = useNavigate();
    const [allReports, setAllReports] = useState<ITeamReport[]>([]);
    const [reports, setReports] = useState<ITeamReport[]>([]);
    const [team, setTeam] = useState<ITeam>(null);

    const isManager = team ? team.teamManager.username === localStorage.getItem("username") : false;

    useEffect(() => {
        if (isManager) {
            const reports: ITeamReport[] = [];
            team.teamMembers.forEach(member => {
                member.reports.forEach(report => {
                    const username = member.username;
                    const teamReport: ITeamReport = { ...report, username }
                    reports.push(teamReport);
                })
            })
            setAllReports(reports);
            setReports(reports);
        }
    }, [team])

    const getAllReports = async () => {
        const response = await ipcRenderer.invoke("get", "/reports", localStorage.getItem("token"));
        if (response.code === 200) {
            setAllReports(response.result);
            setReports(response.result);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    const getTeam = async () => {
        const response = await ipcRenderer.invoke("get", `/teams/${localStorage.getItem("teamId")}`, localStorage.getItem("token"));
        if (response.code === 200) {
            setTeam(response.result);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    useEffect(() => {
        getAllReports();
        getTeam();
    }, []);

    const onChange = (date: any, dateString: any) => {
        if (!dateString) {
            setReports(allReports);
        } else {
            const newReports: ITeamReport[] = allReports.filter((report) =>
                new Date(new Date(report.createdAt).getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10) === dateString);
            setReports(newReports);
        }
    }

    const handleEdit = (report: IReport) => {
        navigate("/frame/editReport", { state: { type: "edit", report } });
    }

    const handleDelete = (item: IReport) => {
        ipcRenderer.invoke("delete", `/reports/${item.id}`, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setReports(reports.filter(report => report.id !== item.id));
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }

    const gotoEditReport = () => {
        const report = reports.filter(report =>
            new Date(new Date(report.createdAt).getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10) ===
            new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10)
        )[0];
        if (report) {
            navigate("/frame/editReport", { state: { type: "edit", report } });
        } else {
            navigate("/frame/editReport", { state: { type: "add" } });
        }
    };

    const columns = [
        {
            title: '创建日期',
            dataIndex: ["createdAt"],
            key: "createdAt",
            align: "center" as "center",
            render: (createdAt: string) => <Tag color="blue">
                {new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10)}
            </Tag>,
        },
        {
            title: '作者',
            dataIndex: isManager ? ["username"] : [],
            key: "username",
            align: "center" as "center",
            render: (username: string) => isManager ? <span>{username}</span> : localStorage.getItem("username"),
        },
        {
            title: '标题',
            dataIndex: ["title"],
            key: "title",
            align: "center" as "center",
            render: (title: string) => <span>{title}</span>,
        },
        {
            title: '操作',
            key: 'operation',
            align: "center" as "center",
            render: (report: ITeamReport) => (
                <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                    <EditTwoTone onClick={() => handleEdit(report)} />
                    <DeleteTwoTone onClick={() => handleDelete(report)} />
                </div >
            )
        },
    ];

    return (
        <>
            <Space style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <DatePicker onChange={onChange} />
                {isManager || <Button type="primary" onClick={gotoEditReport}>编辑今日日报</Button>}
            </Space>
            <Table
                columns={isManager ? columns.slice(0, columns.length - 1) : columns}
                dataSource={reports}
                rowKey={(report: ITeamReport) => report.id}
                onRow={(report: ITeamReport) => {
                    return {
                        onClick: () => navigate("/frame/detail", {
                            state: {
                                ...report, username: isManager ? report.username : localStorage.getItem("username")
                            }
                        })
                    }
                }}
            />
        </>
    )
}

export default Report;