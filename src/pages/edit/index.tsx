import { FC, ReactElement, useState } from "react";
import "./index.css";
import { Col, Form, Input, InputNumber, Row, Slider, Button } from 'antd';
import React from "react";
import TextArea from "antd/lib/input/TextArea";

const Add: FC = (): ReactElement => {
    const [form] = Form.useForm();
    const [time, setTime] = useState<number>(0);
    const [percent, setPercent] = useState<number>(0);

    const onFinish = (values: any) => {
        console.log('Finish:', values);
    };

    const handleTimeChange = (value: number) => {
        setTime(value);
    };

    const handlePercentChange = (value: number) => {
        setPercent(value);
    }

    return (
        <Form form={form} name="report_add" onFinish={onFinish}>
            <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题！' }]}
            >
                <Input placeholder="标题" />
            </Form.Item>
            <Form.Item
                name="finish"
                label="已完成"
            >
                <TextArea placeholder="完成了哪些事？" autoSize={{ minRows: 8 }} />
            </Form.Item>
            <Form.Item
                name="time"
                label="用时/h"
            >
                <Row className="time">
                    <Col span={12}>
                        <Slider
                            min={0}
                            max={24}
                            onChange={handleTimeChange}
                            value={time}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={0}
                            max={24}
                            style={{ margin: '0 16px' }}
                            value={time}
                            onChange={handleTimeChange}
                        />
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item
                name="percent"
                label="完成度"
            >
                <Row className="percent">
                    <Col span={12}>
                        <Slider
                            min={0}
                            max={1}
                            onChange={handlePercentChange}
                            value={percent}
                            step={0.01}
                        />
                    </Col>
                    <Col span={4}>
                        <InputNumber
                            min={0}
                            max={1}
                            style={{ margin: '0 16px' }}
                            step={0.01}
                            value={percent}
                            onChange={handlePercentChange}
                        />
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item
                name="unfinish"
                label="未完成"
            >
                <TextArea placeholder="还有哪些事未完成？" autoSize={{ minRows: 8 }} />
            </Form.Item>
            <Form.Item
                name="thinking"
                label="总结"
            >
                <TextArea placeholder="今日收获与思考..." autoSize={{ minRows: 8 }} />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" className="add-report-button">
                    上传日报
                </Button>
            </Form.Item>
        </Form>
    )
}

export default Add;