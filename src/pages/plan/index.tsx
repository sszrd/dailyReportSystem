import React, { FC, ReactElement, useEffect, useState } from "react";
import "./index.css";
import { Card, Checkbox, Col, Popconfirm, Row } from 'antd';
import { IPlan } from "../../constant/typings";
import { useNavigate } from "react-router-dom";
import PlanEditModal from "../../components/planEditModal";
import ItemEditModal from "../../components/ItemEditModal";
import { DeleteOutlined, DeleteTwoTone } from '@ant-design/icons';
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

    const handleDelete = (path: string) => {
        ipcRenderer.invoke("delete", path, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 401) {
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
                                    <ItemEditModal
                                        type="add"
                                        planId={element.id}
                                        key="plus"
                                    />,
                                    <Popconfirm
                                        title="你确定要移除这个计划吗?"
                                        onConfirm={() => handleDelete(`/plans/${element.id}`)}
                                        okText="确定"
                                        cancelText="取消"
                                    >
                                        <DeleteOutlined key="delete" />
                                    </Popconfirm>

                                ]}
                            >
                                <div className="plan-card">
                                    {
                                        element.items?.map(item => (
                                            <div className="plan-item" key={item.id}>
                                                <Checkbox onChange={() => onChange(element.id, item.id)} checked={item.isFinish}>
                                                    {item.text}
                                                </Checkbox>
                                                <div>
                                                    <ItemEditModal
                                                        type="edit"
                                                        id={item.id}
                                                        planId={element.id}
                                                        text={item.text}
                                                    />
                                                    <Popconfirm
                                                        title="你确定要移除这个条目吗?"
                                                        onConfirm={() => handleDelete(`/items/${item.id}`)}
                                                        okText="确定"
                                                        cancelText="取消"
                                                    >
                                                        <DeleteTwoTone />
                                                    </Popconfirm>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    <div className="plan-date">
                                        {`${new Date(element.startAt.substring(0, 10)).getFullYear()}年${new Date(element.startAt.substring(0, 10)).getMonth() + 1}月${new Date(element.startAt.substring(0, 10)).getDate()}日 - ${new Date(element.deadline.substring(0, 10)).getFullYear()}年${new Date(element.deadline.substring(0, 10)).getMonth() + 1}月${new Date(element.deadline.substring(0, 10)).getDate()}日`}
                                    </div>
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