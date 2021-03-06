import { ITask, IReport } from "../../../constant/typings";
import React, { FC, ReactElement, useEffect, useState } from "react";
import { Button, Form, Input, Select, Slider } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const { ipcRenderer } = window.require("electron");

interface IState {
    type: "add" | "edit",
    report?: IReport,
}

const EditReport: FC = (): ReactElement => {
    const [tasks, setTasks] = useState<ITask[]>([]);
    const navigate = useNavigate();
    const state = useLocation().state as IState;

    const getAllTasks = async () => {
        const response = await ipcRenderer.invoke("get", "/tasks/executedBy", localStorage.getItem("token"));
        if (response.code === 200) {
            setTasks(response.result);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    useEffect(() => {
        getAllTasks();
    }, [])

    const onFinish = async (values: any) => {
        let response;
        switch (state.type) {
            case "add":
                response = await ipcRenderer.invoke("post", "/reports", values, localStorage.getItem("token"));
                break;
            case "edit":
                response = await ipcRenderer.invoke("patch", `/reports/${state.report.id}`, values, localStorage.getItem("token"));
                break;
            default:
                break;
        }
        if (response && response.code === 200) {
            navigate("/frame/report");
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    };

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
                    taskId: state?.report?.taskId,
                    time: state?.report?.time
                }}
            >
                <div className="report-detail-label">??????</div>
                <Form.Item
                    name="title"
                    rules={[{ required: true, message: '???????????????!' }]}
                >
                    <Input placeholder="??????" />
                </Form.Item>
                <div className="report-detail-label">?????????</div>
                <Form.Item
                    name="finish"
                >
                    <TextArea
                        placeholder="???????????????"
                        autoSize={{ minRows: 8 }}
                    />
                </Form.Item>
                <div className="report-detail-label">?????????</div>
                <Form.Item
                    name="unfinish"
                >
                    <TextArea
                        placeholder="???????????????"
                        autoSize={{ minRows: 8 }}
                    />
                </Form.Item>
                <div className="report-detail-label">??????</div>
                <Form.Item
                    name="thinking"
                >
                    <TextArea
                        placeholder="???????????????"
                        autoSize={{ minRows: 8 }}
                    />
                </Form.Item>
                <div className="report-detail-label">??????</div>
                <Form.Item
                    name="time"
                >
                    <Slider
                        min={0}
                        max={24}
                        tipFormatter={(value) => value}
                    />
                </Form.Item>
                <div className="report-detail-label">????????????</div>
                <Form.Item
                    name="taskId"
                    rules={[{ required: true, message: '????????????????????????????????????' }]}
                >
                    <Select style={{ width: '100%' }}>
                        {tasks?.map((task) =>
                            <Select.Option
                                key={task.id}
                                value={task.id}
                            >
                                {task.target}
                            </Select.Option>
                        )}
                    </Select>
                </Form.Item>
                <Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button type="default" className="report-form-button" onClick={() => navigate(-1)}>
                            ??????
                        </Button>
                        <Button type="primary" htmlType="submit" className="report-form-button">
                            ??????
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </>
    );
}

export default EditReport;