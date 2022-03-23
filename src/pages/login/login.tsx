import React, { MutableRefObject, useEffect } from "react";
import { FC, ReactElement } from "react";
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

interface IProps {
    containerRef: MutableRefObject<HTMLDivElement>
}

const Login: FC<IProps> = (props: IProps): ReactElement => {
    const navigate = useNavigate();
    const onFinish = async (values: any) => {
        const response = await ipcRenderer.invoke("post", values);
        if (response.code === 200) {
            localStorage.setItem("token", response.result.token);
        }
        ipcRenderer.send("goto home page");
        navigate("/");
    };

    const onGoto = () => {
        props.containerRef.current.style.transform = `translate(-50%,0)`;
    }

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
        >
            <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入您的用户名!' }]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入您的密码!' }]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="密码"
                />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                    登录
                </Button>
            </Form.Item>
            <Form.Item>
                <Button type="default" className="goto-button" onClick={onGoto}>
                    注册
                </Button>
            </Form.Item>
        </Form>
    )
}

export default Login;