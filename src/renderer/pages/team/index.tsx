import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { List, Button, Modal, Form, Input, Popconfirm, notification, Tag } from 'antd';
import { UserDeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { ITeam } from "../../../constant/typings";

const { ipcRenderer } = window.require("electron");

const Team: FC = (): ReactElement => {
    const navigate = useNavigate();
    const [team, setTeam] = useState<ITeam>(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [teamId, setTeamId] = useState(0);
    const username = localStorage.getItem("username");

    const isManager = useMemo(() => {
        if (team) {
            return team.teamManager.username === username;
        }
        return false;
    }, [team])

    useEffect(() => {
        setTeamId(Number(localStorage.getItem("teamId")));
    }, [])

    useEffect(() => {
        if (teamId) {
            ipcRenderer.invoke("get", `/teams/${localStorage.getItem("teamId")}`, localStorage.getItem("token"))
                .then(response => {
                    if (response.code === 200) {
                        setTeam(response.result);
                    } else if (response.code === 401) {
                        localStorage.removeItem("token");
                        ipcRenderer.send("goto login page");
                        navigate("/login");
                    }
                })
        } else {
            setTeam(null);
        }
    }, [teamId]);

    const showCreateModal = () => {
        setCreateModalVisible(true);
    };

    const showApplyModal = () => {
        setApplyModalVisible(true);
    }

    const handleCreateOk = (values: any) => {
        ipcRenderer.invoke("post", `/teams`, values, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    localStorage.setItem("teamId", response.result.id);
                    setTeamId(response.result.id);
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
        setCreateModalVisible(false);
    };

    const handleCreateCancel = () => {
        setCreateModalVisible(false);
    };

    const handleApplyOk = (values: any) => {
        ipcRenderer.invoke("post", `/applications`, values, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    notification.open({
                        message: '申请成功',
                        description: '您提交的申请已提交，等待团队管理员审核',
                        onClick: () => {
                            navigate("/frame/application");
                        },
                    });
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
        setApplyModalVisible(false);
    };

    const handleApplyCancel = () => {
        setApplyModalVisible(false);
    };

    const handleDeleteTeam = () => {
        if (isManager) {
            ipcRenderer.invoke("delete", `/teams/${teamId}`, localStorage.getItem("token"))
                .then(response => {
                    if (response.code === 200) {
                        localStorage.setItem("teamId", "0");
                        setTeamId(0);
                    } else if (response.code === 401) {
                        localStorage.removeItem("token");
                        ipcRenderer.send("goto login page");
                        navigate("/login");
                    }
                })
        } else {
            ipcRenderer.invoke("patch", `/users`, { teamId: 0 }, localStorage.getItem("token"))
                .then(response => {
                    if (response.code === 200) {
                        localStorage.setItem("teamId", "0");
                        setTeamId(0);
                    } else if (response.code === 401) {
                        localStorage.removeItem("token");
                        ipcRenderer.send("goto login page");
                        navigate("/login");
                    }
                })
        }
    }

    const handleDeleteMember = (id: number) => {
        ipcRenderer.invoke("patch", `/users/${id}`, { teamId: 0 }, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    const teamMembers = team.teamMembers.filter(user => user.id !== id);
                    setTeam({ ...team, teamMembers });
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }

    return (
        <>
            <List
                header={teamId ?
                    <div style={{ display: "flex", justifyContent: "space-between" }} >
                        <Tag color="blue" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {`No.${team?.id} ${team?.name}`}
                        </Tag>
                        <Popconfirm
                            title={`确定要${isManager ? "解散" : "离开"}该团队吗？`}
                            onConfirm={handleDeleteTeam}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button type="primary" danger >{isManager ? "解散团队" : "离开团队"}</Button>
                        </Popconfirm>

                    </div> :
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button type="primary" danger onClick={showCreateModal}>创建团队</Button>
                        <Button type="primary" onClick={showApplyModal}>加入团队</Button>
                    </div>}
                bordered
                dataSource={team ? team.teamMembers : []}
                renderItem={item => (
                    <List.Item>
                        <Tag color={item.username === team.teamManager.username ? "purple" : "default"}>
                            <UserOutlined />
                            <span>{item.username}</span>
                        </Tag>
                        {isManager && item.username !== username ?
                            <Popconfirm
                                title="确定要请离这位成员吗？"
                                onConfirm={() => handleDeleteMember(item.id)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <UserDeleteOutlined />
                            </Popconfirm> : <></>}
                    </List.Item>
                )}
            />
            < Modal title="创建团队" visible={createModalVisible} footer={null} onCancel={handleCreateCancel} >
                <Form
                    name="basic"
                    onFinish={handleCreateOk}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                >
                    <Form.Item
                        label="团队名称"
                        name="name"
                        rules={[{ required: true, message: '请输入你要创建的团队名称！' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="管理员"
                        name="manager"
                    >
                        <Input placeholder={username} disabled />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button type="default" onClick={handleCreateCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal >
            <Modal title="加入团队" visible={applyModalVisible} footer={null} onCancel={handleApplyCancel}>
                <Form
                    name="basic"
                    onFinish={handleApplyOk}
                >
                    <Form.Item
                        label="团队编号"
                        name="teamId"
                        rules={[{ required: true, message: '请输入你要加入的团队编号！' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button type="default" onClick={handleApplyCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default Team;