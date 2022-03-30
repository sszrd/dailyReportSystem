import { Button, Input, Modal, DatePicker } from "antd";
import React, { FC, ReactElement, useEffect, useState } from "react";
import { PlusCircleFilled, FormOutlined } from "@ant-design/icons";
import moment from 'moment';
import "./index.css";
import { useNavigate } from "react-router-dom";
const { RangePicker } = DatePicker;
const { ipcRenderer } = window.require("electron");

interface IProps {
    type: "edit" | "add",
    id?: number,
    target?: string,
    date?: IDate
}

interface IDate {
    start: string,
    end: string
}

const PlanEditModal: FC<IProps> = (props: IProps): ReactElement => {
    const [loading, setLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const [target, setTarget] = useState<string>("");
    const [date, setDate] = useState<IDate>({
        start: new Date().toISOString().substring(0, 10), end: new Date().toISOString().substring(0, 10)
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (props.target) {
            setTarget(props.target);
        }
        if (props.date) {
            setDate({
                start: props.date.start,
                end: props.date.end
            })
        }
    }, [props])

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const handleOk = () => {
        setLoading(true);
        let method = props.type === "add" ? "post" : "patch";
        let path = props.type === "add" ? "/plans" : `/plans/${props.id}`;
        ipcRenderer.invoke(method, path, {
            target,
            startAt: date.start,
            deadline: date.end
        }, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
            .finally(() => {
                setLoading(false);
                setVisible(false);
            })
    }

    const handleTargetChange = (ref: any) => {
        setTarget(ref.target.value);
    }

    const handleDateChange = (date: any, dateString: any) => {
        setDate({
            start: dateString[0].substring(0, 10),
            end: dateString[1].substring(0, 10)
        })
    }

    return (
        <>
            {
                props.type === "add" ? <PlusCircleFilled onClick={showModal} style={{ fontSize: "24px" }} /> : <FormOutlined onClick={showModal} />
            }
            <Modal
                visible={visible}
                title={props.type === "add" ? "新增计划" : "编辑计划"}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        取消
                    </Button>,
                    <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                        提交
                    </Button>
                ]}
            >
                <div style={{ marginBottom: "20px" }}>
                    <div className="plan-edit-label">
                        目标
                    </div>
                    <Input
                        placeholder="目标"
                        value={target}
                        onChange={handleTargetChange}
                        className="plan-edit-input"
                    />
                </div>
                <div>
                    <div className="plan-edit-label">
                        开始日期 - 截止日期
                    </div>
                    <RangePicker
                        showTime
                        value={[moment(date.start, "YYYY/MM/DD"), moment(date.end, "YYYY/MM/DD")]}
                        onChange={handleDateChange}
                        className="plan-edit-input"
                    />
                </div>
            </Modal>
        </>
    );
}

export default PlanEditModal;