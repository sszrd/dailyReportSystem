import { FC, ReactElement, MutableRefObject } from "react";
import React, { useEffect } from "react";
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

interface IProps {
    containerRef: MutableRefObject<HTMLDivElement>
}

const Register: FC<IProps> = (props: IProps): ReactElement => {
    const onFinish = (values: any) => {

    };

    const onGoto = () => {
        props.containerRef.current.style.transform = `translate(0,0)`;
    }

    return (
        <Form
            name="normal_register"
            className="register-form"
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
            <Form.Item
                name="password"
                rules={[{ required: true, message: '请重复输入您的密码!' }]}
            >
                <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="repeat"
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