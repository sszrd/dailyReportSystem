import React, { FC, ReactElement, useEffect, useState } from "react";
import { Layout, Menu } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    HomeOutlined,
    FileAddOutlined,
    FileSearchOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import "./index.css";
import { Outlet, useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

const { Header, Sider, Content } = Layout;

const Frame: FC = (): ReactElement => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }, [])

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="logo" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate("/frame/home")}>
                        主页
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FileAddOutlined />} onClick={() => navigate("/frame/plan")}>
                        我的计划
                    </Menu.Item>
                    <Menu.Item key="3" icon={<FileSearchOutlined />} onClick={() => navigate("/frame/report")}>
                        日报管理
                    </Menu.Item>
                    <Menu.Item key="4" icon={<LineChartOutlined />} onClick={() => navigate("/frame/statistics")}>
                        数据统计
                    </Menu.Item>
                    <Menu.Item key="5" icon={<UserOutlined />} onClick={() => navigate("/frame/user")}>
                        个人中心
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