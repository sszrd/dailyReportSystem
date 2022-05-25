import React, { FC, ReactElement, useState } from "react";
import { Avatar, Button, Input, Modal, Popconfirm, Popover } from 'antd';
import { KeyOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

const User: FC = (): ReactElement => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const handleRevisePassword = () => {
        setIsModalVisible(true);
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        ipcRenderer.send("goto login page");
        navigate("/login");
    }

    const handleOk = () => {
        ipcRenderer.invoke("patch", "/users", { password }, localStorage.getItem("token"))
            .then(response => setIsModalVisible(false))
    }

    const handleCancel = () => {
        setIsModalVisible(false);
    }

    const handleInputPassword = (e: any) => {
        setPassword(e.target.value);
    }

    const confirm = () => {
        handleLogout();
    }

    const content = (
        <>
            <Modal title="修改密码" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Input.Password placeholder="输入新的密码" prefix={<KeyOutlined />} onChange={handleInputPassword} value={password} />
            </Modal>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Button type="primary" style={{ marginBottom: "8px" }} onClick={handleRevisePassword}>修改密码</Button>
                <Popconfirm
                    title="确定要注销登录吗?"
                    onConfirm={confirm}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button type="primary" danger>注销</Button>
                </Popconfirm>
            </div>
        </>
    );
    return (
        <Popover content={content} title="用户操作" trigger="click" placement="right">
            <div className="logo" >
                <Avatar size={64} icon={<UserOutlined />} />
                <div className="logo-username">
                    {localStorage.getItem("username")}
                </div>
            </div>
        </Popover>
    )
}

export default User;