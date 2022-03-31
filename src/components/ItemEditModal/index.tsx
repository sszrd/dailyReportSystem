import { Button, Input, Modal } from "antd";
import React, { FC, ReactElement, useEffect, useState } from "react";
import { PlusOutlined, EditTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

interface IProps {
    type: "edit" | "add",
    id?: number,
    planId: number,
    text?: string,
    refresh: () => void
}

const ItemEditModal: FC<IProps> = (props: IProps): ReactElement => {
    const [loading, setLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(false);
    const [text, setText] = useState<string>("");
    const navigate = useNavigate();

    useEffect(() => {
        if (props.text) {
            setText(props.text);
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
        let path = props.type === "add" ? "/items" : `/items/${props.id}`;
        ipcRenderer.invoke(method, path, {
            text,
            planId: props.planId
        }, localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    props.refresh();
                } else if (response.code === 401) {
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

    const handleChange = (ref: any) => {
        setText(ref.target.value);
    }

    return (
        <>
            {
                props.type === "add" ? <PlusOutlined onClick={showModal} /> : <EditTwoTone onClick={showModal} />
            }
            <Modal
                visible={visible}
                title={props.type === "add" ? "新增条目" : "编辑条目"}
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
                <Input
                    placeholder="为这个计划添加/修改条目"
                    value={text}
                    onChange={handleChange}
                    className="plan-edit-input"
                />
            </Modal>
        </>
    );
}

export default ItemEditModal;