import React, { FC, ReactElement, useEffect, useState } from "react";
import "./index.css";
import { Card, Checkbox, Col, Row } from 'antd';
import { IPlan } from "../../constant/typings";
import { useNavigate } from "react-router-dom";
import PlanEditModal from "../../components/planEditModal";
import { PlusOutlined } from "@ant-design/icons";
const { ipcRenderer } = window.require("electron");

const Plan: FC = (): ReactElement => {
    const [plans, setPlans] = useState<IPlan[]>();
    const navigate = useNavigate();

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

    const onChange = (planId: number, itemId: number) => {
        const plan = plans.filter(ele => ele.id === planId)[0];
        const item = plan.items.filter(ele => ele.id === itemId)[0];
        item.isFinish = !item.isFinish;
        ipcRenderer.invoke("patch", `/items/${itemId}`, { isFinish: item.isFinish }, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setPlans([...plans]);
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }

    return (
        <div className="site-card-wrapper" >
            <div className="btn-plan-add">
                <PlanEditModal type="add" />
            </div>
            <Row gutter={16}>
                {
                    plans?.map(element => (
                        <Col span={8} key={element.id}>
                            <Card title={element.target}
                                bordered
                                actions={[
                                    <PlanEditModal
                                        type="edit"
                                        target={element.target}
                                        date={{ start: element.startAt, end: element.deadline }}
                                        id={element.id}
                                        key="edit"
                                    />,
                                    <PlusOutlined key="plus" />
                                ]}
                            >
                                <div className="plan-card">
                                    <div className="plan-date">
                                        {`${new Date(element.startAt.substring(0, 10)).getFullYear()}年${new Date(element.startAt.substring(0, 10)).getMonth() + 1}月${new Date(element.startAt.substring(0, 10)).getDate()}日 - ${new Date(element.deadline.substring(0, 10)).getFullYear()}年${new Date(element.deadline.substring(0, 10)).getMonth() + 1}月${new Date(element.deadline.substring(0, 10)).getDate()}日`}
                                    </div>
                                    {
                                        element.items?.map(item => (
                                            <span className="plan-item" key={item.id}>
                                                <Checkbox onChange={() => onChange(element.id, item.id)} checked={item.isFinish}>
                                                    {item.text}
                                                </Checkbox>
                                            </span>
                                        ))
                                    }
                                </div>
                            </Card>
                        </Col>
                    ))
                }
            </Row>
        </div>
    )
}

export default Plan;