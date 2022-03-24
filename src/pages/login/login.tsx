import React, { MutableRefObject, useEffect } from "react";
import { FC, ReactElement } from "react";
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useForm } from "antd/lib/form/Form";
const { ipcRenderer } = window.require("electron");

interface IProps {
    containerRef: MutableRefObject<HTMLDivElement>
}

const Login: FC<IProps> = (props: IProps): ReactElement => {
    const navigate = useNavigate();
    const [form] = useForm();

    const onFinish = async (values: any) => {
        const response = await ipcRenderer.invoke("post", "/users/login", values);
        if (response.code === 200) {
            localStorage.setItem("token", response.result.token);
            navigate("/frame");
            ipcRenderer.send("goto home page");
        } else {
            ipcRenderer.send("show message-box", response.message);
            form.resetFields();
        }
    };

    const onGoto = () => {
        props.containerRef.current.style.transform = `translate(-50%,0)`;
        form.resetFields();
    }

    return (
        <Form
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            form={form}
        >
            <Form.Item
                name="username"
                rules={[
                    { required: true, message: '请输入您的用户名!' },
                    { min: 6, message: '用户名不低于6位!' },
                    { max: 12, message: '用户名不超过12位!' }
                ]}
            >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
            </Form.Item>
            <Form.Item
                name="password"
                rules={[
                    { required: true, message: '请输入您的密码!' },
                    { min: 6, message: '密码不低于6位!' },
                    { max: 12, message: '密码不超过12位!' }
                ]}
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