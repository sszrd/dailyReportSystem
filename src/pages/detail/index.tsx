import { IPlan, IReport } from "../../constant/typings";
import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import "./index.css";
import { Button, Form, Input, Modal, Slider } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useLocation, useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

interface IState {
    type: "add" | "edit",
    report?: IReport
}

const Detail: FC = (): ReactElement => {
    const [plans, setPlans] = useState<IPlan[]>([]);
    const navigate = useNavigate();
    const state = useLocation().state as IState;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        navigate("/frame/plan");
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    useEffect(() => {
        ipcRenderer.invoke("get", "/plans", localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setPlans(Object.values(response.result));
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }, [])

    const curPlan: IPlan = useMemo(() => plans?.filter(plan =>
        new Date().getTime() >= new Date(plan.startAt).getTime() &&
        new Date().getTime() <= new Date(plan.deadline).getTime())[0],
        [plans]
    );

    const onFinish = (values: any) => {
        if (!curPlan) {
            showModal();
            return;
        }
        switch (state.type) {
            case "add":
                Promise.all([
                    ipcRenderer.invoke(
                        "post",
                        "/reports",
                        values,
                        localStorage.getItem("token")
                    ),
                    ipcRenderer.invoke("patch",
                        `/plans/${curPlan.id}`,
                        { totalTime: values.time + curPlan.totalTime },
                        localStorage.getItem("token")
                    )
                ])
                    .then(() => navigate("/frame/report"))
                break;
            case "edit":
                Promise.all([
                    ipcRenderer.invoke("patch",
                        `/reports/${state.report.id}`,
                        values,
                        localStorage.getItem("token")
                    ),
                    ipcRenderer.invoke("patch",
                        `/plans/${curPlan.id}`,
                        { totalTime: values.time + curPlan.totalTime - state.report.time },
                        localStorage.getItem("token")
                    )
                ])
                    .then(() => navigate("/frame/report"))
                break;
            default:
                break;
        }
    };

    const formatter = (value: any) => {
        return `${value}%`;
    }

    return (
        <>
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
            <Modal title="提示"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="确认"
                cancelText="取消">
                <p>当前时间还没有计划，是否创建计划？</p>
            </Modal>
        </>
    );
}

export default Detail;