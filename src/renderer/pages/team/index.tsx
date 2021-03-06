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
                        message: '????????????',
                        description: '?????????????????????????????????????????????????????????',
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
                            title={`?????????${isManager ? "??????" : "??????"}???????????????`}
                            onConfirm={handleDeleteTeam}
                            okText="??????"
                            cancelText="??????"
                        >
                            <Button type="primary" danger >{isManager ? "????????????" : "????????????"}</Button>
                        </Popconfirm>

                    </div> :
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button type="primary" danger onClick={showCreateModal}>????????????</Button>
                        <Button type="primary" onClick={showApplyModal}>????????????</Button>
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
                                title="?????????????????????????????????"
                                onConfirm={() => handleDeleteMember(item.id)}
                                okText="??????"
                                cancelText="??????"
                            >
                                <UserDeleteOutlined />
                            </Popconfirm> : <></>}
                    </List.Item>
                )}
            />
            < Modal title="????????????" visible={createModalVisible} footer={null} onCancel={handleCreateCancel} >
                <Form
                    name="basic"
                    onFinish={handleCreateOk}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                >
                    <Form.Item
                        label="????????????"
                        name="name"
                        rules={[{ required: true, message: '???????????????????????????????????????' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="?????????"
                        name="manager"
                    >
                        <Input placeholder={username} disabled />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button type="default" onClick={handleCreateCancel}>
                                ??????
                            </Button>
                            <Button type="primary" htmlType="submit">
                                ??????
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal >
            <Modal title="????????????" visible={applyModalVisible} footer={null} onCancel={handleApplyCancel}>
                <Form
                    name="basic"
                    onFinish={handleApplyOk}
                >
                    <Form.Item
                        label="????????????"
                        name="teamId"
                        rules={[{ required: true, message: '???????????????????????????????????????' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button type="default" onClick={handleApplyCancel}>
                                ??????
                            </Button>
                            <Button type="primary" htmlType="submit">
                                ??????
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default Team;