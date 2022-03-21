import React, { FC, ReactElement, useState } from "react";
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

const { Header, Sider, Content } = Layout;

const Frame: FC = (): ReactElement => {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const toggle = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div className="logo" />
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1" icon={<HomeOutlined />}>
                        主页
                    </Menu.Item>
                    <Menu.Item key="2" icon={<FileAddOutlined />}>
                        新建日报
                    </Menu.Item>
                    <Menu.Item key="3" icon={<FileSearchOutlined />}>
                        日报管理
                    </Menu.Item>
                    <Menu.Item key="4" icon={<LineChartOutlined />}>
                        数据统计
                    </Menu.Item>
                    <Menu.Item key="5" icon={<UserOutlined />}>
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
                    Content
                </Content>
            </Layout>
        </Layout>
    );
}

export default Frame;