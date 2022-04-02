import { IReport } from "../../constant/typings";
import React, { FC, ReactElement } from "react";
import "./index.css";
import { Button, Form, Input, Slider } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useLocation, useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

interface IState {
    type: "add" | "edit",
    report?: IReport
}

const Detail: FC = (): ReactElement => {
    const navigate = useNavigate();
    const state = useLocation().state as IState;

    const onFinish = (values: any) => {
        let request: Promise<any>;
        switch (state.type) {
            case "add":
                request = ipcRenderer.invoke("post", "/reports", values, localStorage.getItem("token"));
                break;
            case "edit":
                request = ipcRenderer.invoke("patch", `/reports/${state.report.id}`, values, localStorage.getItem("token"));
                break;
            default:
                break;
        }
        request.then(response => {
            if (response.code === 200) {
                navigate(-1);
            } else if (response.code === 401) {
                localStorage.removeItem("token");
                ipcRenderer.send("goto login page");
                navigate("/login");
            }
        })
    };

    const formatter = (value: any) => {
        return `${value}%`;
    }

    return (
        <Form
            name="report_detail"
            className="report-detail-form"
            onFinish={onFinish}
            initialValues={{
                title: state?.report?.title,
                finish: state?.report?.finish,
                unfinish: state?.report?.unfinish,
                thinking: state?.report?.thinking,
                percent: state?.report?.percent,
                time: state?.report?.time
            }}
        >
            <div className="report-detail-label">标题</div>
            <Form.Item
                name="title"
                rules={[{ required: true, message: '请输入标题!' }]}
            >
                <Input placeholder="标题" />
            </Form.Item>
            <div className="report-detail-label">已完成</div>
            <Form.Item
                name="finish"
            >
                <TextArea
                    placeholder="已完成项目"
                    autoSize={{ minRows: 8 }}
                />
            </Form.Item>
            <div className="report-detail-label">未完成</div>
            <Form.Item
                name="unfinish"
            >
                <TextArea
                    placeholder="未完成项目"
                    autoSize={{ minRows: 8 }}
                />
            </Form.Item>
            <div className="report-detail-label">总结</div>
            <Form.Item
                name="thinking"
            >
                <TextArea
                    placeholder="思考与总结"
                    autoSize={{ minRows: 8 }}
                />
            </Form.Item>
            <div className="report-detail-label">完成率</div>
            <Form.Item
                name="percent"
            >
                <Slider
                    tipFormatter={formatter}
                />
            </Form.Item>
            <div className="report-detail-label">用时</div>
            <Form.Item
                name="time"
            >
                <Slider
                    min={0}
                    max={24}
                    tipFormatter={(value) => value}
                />
            </Form.Item>
            <Form.Item>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button type="default" className="report-form-button" onClick={() => navigate(-1)}>
                        返回
                    </Button>
                    <Button type="primary" htmlType="submit" className="report-form-button">
                        提交
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
}

export default Detail;