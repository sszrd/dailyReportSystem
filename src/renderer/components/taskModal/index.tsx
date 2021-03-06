import { Button, Input, Modal, DatePicker, Form, Select } from "antd";
import React, { FC, ReactElement, useState } from "react";
import { PlusSquareOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ITask, ITeam } from "../../../constant/typings";
import moment from 'moment';

const { RangePicker } = DatePicker;
const { ipcRenderer } = window.require("electron");

interface IProps {
    type: "create" | "edit",
    team: ITeam,
    task?: ITask,
    tasks: ITask[],
    setTasks: Function
}

const TaskModal: FC<IProps> = (props: IProps): ReactElement => {
    const [visible, setVisible] = useState<boolean>(false);

    const navigate = useNavigate();

    const showModal = () => {
        setVisible(true);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    const handleOk = async (values: any) => {
        if (props.type === "create") {
            const response = await ipcRenderer.invoke("post", "/tasks", {
                target: values.target,
                executedBy: values.executedBy,
                startAt: new Date(values.times[0]._d).toJSON(),
                deadline: new Date(values.times[1]._d).toJSON()
            }, localStorage.getItem("token"));
            if (response.code === 200) {
                props.setTasks([...props.tasks, response.result]);
            } else if (response.code === 401) {
                localStorage.removeItem("token");
                ipcRenderer.send("goto login page");
                navigate("/login");
            }
        } else if (props.type === "edit") {
            const patchObj = {
                target: values.target,
                executedBy: values.executedBy,
                startAt: new Date(new Date(values.times[0]._d).getTime() + 8 * 60 * 60 * 1000).toJSON(),
                deadline: new Date(new Date(values.times[1]._d).getTime() + 8 * 60 * 60 * 1000).toJSON()
            }
            const response = await ipcRenderer.invoke("patch", `/tasks/${props.task.id}`, patchObj, localStorage.getItem("token"));
            if (response.code === 200) {
                props.tasks.forEach(task => {
                    if (task.id === props.task.id) {
                        task.target = patchObj.target;
                        task.executedBy = patchObj.executedBy;
                        task.startAt = patchObj.startAt;
                        task.deadline = patchObj.deadline
                    }
                })
                props.setTasks([...props.tasks]);
            } else if (response.code === 401) {
                localStorage.removeItem("token");
                ipcRenderer.send("goto login page");
                navigate("/login");
            }
        }
        setVisible(false);
    };

    return (
        <>
            {
                props.type === "create" ?
                    <PlusSquareOutlined onClick={showModal} style={{ fontSize: "18px" }} />
                    :
                    <FormOutlined onClick={showModal} />
            }
            <Modal
                title={props.type === "create" ? "????????????" : "????????????"}
                visible={visible}
                onCancel={handleCancel} footer={null}
            >
                <Form
                    name="basic"
                    onFinish={handleOk}
                    initialValues={props.type === "create" ? null :
                        {
                            target: props.task?.target,
                            executedBy: props.task?.executedBy,
                            times: [moment(props.task?.createdAt, "YYYY/MM/DD"), moment(props.task?.deadline, "YYYY/MM/DD")]
                        }
                    }
                >
                    <Form.Item
                        label="????????????"
                        name="target"
                        rules={[{ required: true, message: '??????????????????????????????????????????' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        name="executedBy"
                        rules={[{ required: true, message: '???????????????????????????????????????' }]}
                    >
                        <Select style={{ width: '100%' }}>
                            {props.team?.teamMembers.filter(member => member.id !== props.team.teamManager.id)
                                .map((member) =>
                                    <Select.Option
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.username}
                                    </Select.Option>
                                )
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        name="times"
                        rules={[{ required: true, message: '??????????????????????????????????????????' }]}
                    >
                        <RangePicker
                            showTime
                            disabled={[false, false]}
                        />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <Button type="default" onClick={handleCancel}>
                                ??????
                            </Button>
                            <Button type="primary" htmlType="submit">
                                ??????
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default TaskModal;