import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import "./index.css";
import { Card, Checkbox, Col, Popconfirm, Row, DatePicker } from 'antd';
import { IPlan } from "../../constant/typings";
import { useNavigate } from "react-router-dom";
import PlanEditModal from "../../components/planEditModal";
import ItemEditModal from "../../components/ItemEditModal";
import { DeleteOutlined, DeleteTwoTone } from '@ant-design/icons';
import moment from "moment";
const { ipcRenderer } = window.require("electron");
const { RangePicker } = DatePicker;

const Plan: FC = (): ReactElement => {
    const [plans, setPlans] = useState<IPlan[]>();
    const navigate = useNavigate();

    const getAllPlans = () => {
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
    }

    const curPlan: IPlan = useMemo(() => plans?.filter(plan =>
        new Date().getTime() >= new Date(plan.startAt).getTime() &&
        new Date().getTime() <= new Date(plan.deadline).getTime())[0],
        [plans]
    );

    const updateProgress = (plan: IPlan) => {
        const progress = plan.items.reduce((prev, cur) => prev + Number(cur.isFinish), 0) / plan.items.length;
        ipcRenderer.invoke("patch", `/plans/${plan.id}`, { progress }, localStorage.getItem("token"));
    }

    useEffect(() => {
        getAllPlans();
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
            .then(() => {
                updateProgress(plan);
            })
    }

    const handleDelete = (path: string) => {
        ipcRenderer.invoke("delete", path, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    getAllPlans();
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
                {
                    curPlan ?
                        <PlanEditModal type="edit"
                            target={curPlan.target}
                            date={{ start: curPlan.startAt, end: curPlan.deadline }}
                            id={curPlan.id}
                            refresh={getAllPlans}
                            large
                        />
                        :
                        <PlanEditModal type="add" refresh={getAllPlans} large />
                }
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
                                        refresh={getAllPlans}
                                    />,
                                    <ItemEditModal
                                        type="add"
                                        planId={element.id}
                                        key="plus"
                                        refresh={getAllPlans}
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
                                                        refresh={getAllPlans}
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
                                    <RangePicker
                                        value={[moment(element.startAt.substring(0, 10), 'YYYY-MM-DD'), moment(element.deadline.substring(0, 10), 'YYYY-MM-DD')]}
                                        disabled
                                    />
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