import React, { FC, ReactElement, useEffect, useState } from "react";
import { Layout, Menu, notification } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    HomeOutlined,
    ProjectOutlined,
    CalendarOutlined,
    LineChartOutlined,
    TeamOutlined,
    UnorderedListOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import "./index.css";
import { Outlet, useNavigate } from "react-router-dom";
import User from "../../components/user";
const { ipcRenderer } = window.require("electron");

const { Header, Sider, Content } = Layout;

const Frame: FC = (): ReactElement => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [teamId, setTeamId] = useState(Number(localStorage.getItem("teamId")));

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }, [])

    useEffect(() => {
        const timer = setInterval(() => {
            ipcRenderer.invoke("get", "/users", localStorage.getItem("token"))
                .then(response => {
                    if (response.code === 200) {
                        setTeamId((teamId) => {
                            if (response.result.teamId !== teamId) {
                                localStorage.setItem("teamId", response.result.teamId);
                                notification.open({
                                    message: '团队信息变更提醒',
                                    description: '您当前团队发生变更，前往团队管理查看详情',
                                    onClick: () => {
                                        navigate("/frame/team");
                                    },
                                });
                                return response.result.teamId;
                            } else {
                                return teamId;
                            }
                        })
                    } else if (response.code === 401) {
                        localStorage.removeItem("token");
                        ipcRenderer.send("goto login page");
                        navigate("/login");
                    }
                })
        }, 5000)
        return () => {
            clearInterval(timer);
        }
    }, [localStorage.getItem("")])

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <User />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate("/frame/home")}>
                        主页
                    </Menu.Item>
                    <Menu.Item key="2" icon={<ProjectOutlined />} onClick={() => navigate("/frame/plan")}>
                        任务管理
                    </Menu.Item>
                    <Menu.Item key="3" icon={<CalendarOutlined />} onClick={() => navigate("/frame/report")}>
                        日报管理
                    </Menu.Item>
                    <Menu.SubMenu key="4" icon={<TeamOutlined />} title="团队管理">
                        <Menu.Item key="5" icon={<UnorderedListOutlined />} onClick={() => navigate("/frame/team")}>
                            人员列表
                        </Menu.Item>
                        <Menu.Item key="6" icon={<UserAddOutlined />} onClick={() => navigate("/frame/application")}>
                            申请列表
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key="7" icon={<LineChartOutlined />} onClick={() => navigate("/frame/statistics")}>
                        数据统计
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-background" style={{ padding: 0 }}>
                    {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: toggle,
                    })}
                </Header>
                <Content
                    className="site-layout-background"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default Frame;