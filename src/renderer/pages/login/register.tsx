import { FC, ReactElement, MutableRefObject } from "react";
import React, { useEffect } from "react";
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useForm } from "antd/lib/form/Form";
const { ipcRenderer } = window.require("electron");

interface IProps {
    containerRef: MutableRefObject<HTMLDivElement>
}

const Register: FC<IProps> = (props: IProps): ReactElement => {
    const [form] = useForm();

    const onFinish = async (values: any) => {
        const { repeat, ...user } = values;
        const response = await ipcRenderer.invoke("post", "/users/register", user);
        if (response.code === 200) {
            form.resetFields();
            props.containerRef.current.style.transform = `translate(0,0)`;
        } else {
            ipcRenderer.send("show message-box", response.message);
            form.resetFields();
        }
    };

    const onGoto = () => {
        props.containerRef.current.style.transform = `translate(0,0)`;
        form.resetFields();
    }

    return (
        <Form
            name="normal_register"
            className="register-form"
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
            <Form.Item
                name="repeat"
                rules={[
                    ({ getFieldValue }) => ({
                        validator(rule, value) {
                            if (!value || getFieldValue("password") !== value) {
                                return Promise.reject("两次密码输入不一致");
                            }
                            return Promise.resolve();
                        }
                    })
                ]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="重复密码"
                />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="register-form-button">
                    注册
                </Button>
            </Form.Item>
            <Form.Item>
                <Button type="default" className="goto-button" onClick={onGoto}>
                    登录
                </Button>
            </Form.Item>
        </Form>
    )
}

export default Register;