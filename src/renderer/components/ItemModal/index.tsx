import { Button, Input, Modal, Form } from "antd";
import React, { FC, ReactElement, useState } from "react";
import { PlusOutlined, EditTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { IItem, ITask } from "../../../constant/typings";

const { ipcRenderer } = window.require("electron");

interface IProps {
    type: "create" | "edit",
    taskId: number,
    item?: IItem,
    tasks: ITask[],
    setTasks: Function
}

const ItemModal: FC<IProps> = (props: IProps): ReactElement => {
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
            const response = await ipcRenderer.invoke("post", "/items", {
                text: values.text,
                taskId: props.taskId
            }, localStorage.getItem("token"));
            if (response.code === 200) {
                props.tasks.filter(task => task.id === props.taskId)[0].items.push(response.result);
                props.setTasks([...props.tasks]);
            } else if (response.code === 401) {
                localStorage.removeItem("token");
                ipcRenderer.send("goto login page");
                navigate("/login");
            }
        } else if (props.type === "edit") {
            const response = await ipcRenderer.invoke("patch", `/items/${props.item.id}`, values, localStorage.getItem("token"));
            if (response.code === 200) {
                props.tasks.filter(task => task.id === props.taskId)[0].items.forEach(item => {
                    if (item.id === props.item.id) {
                        item.text = values.text;
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
                    <PlusOutlined onClick={showModal} style={{ fontSize: "18px" }} />
                    :
                    <EditTwoTone onClick={showModal} />
            }
            <Modal
                title={props.type === "create" ? "????????????" : "????????????"}
                visible={visible}
                onCancel={handleCancel} footer={null}
            >
                <Form
                    name="basic"
                    onFinish={handleOk}
                    initialValues={props.type === "create" ? null : { text: props.item?.text, }}
                >
                    <Form.Item
                        label="????????????"
                        name="text"
                        rules={[{ required: true, message: '??????????????????????????????????????????' }]}
                    >
                        <Input />
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

export default ItemModal;