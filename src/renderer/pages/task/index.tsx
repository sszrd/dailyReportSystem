import React, { FC, ReactElement, useEffect, useState } from "react";
import { Card, Checkbox, Popconfirm, DatePicker, List, Tag, Button, Divider } from 'antd';
import { ITask, ITeam } from "../../../constant/typings";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined, DeleteTwoTone } from '@ant-design/icons';
import moment from "moment";
import TaskModal from "../../components/taskModal";
import ItemModal from "../../components/ItemModal";

const { ipcRenderer } = window.require("electron");
const { RangePicker } = DatePicker;

const Task: FC = (): ReactElement => {
    const [tasks, setTasks] = useState<ITask[]>();
    const [team, setTeam] = useState<ITeam>(null);
    const [status, setStatus] = useState(0);  //0显示全部任务，1显示已完成任务，2显示未完成任务

    const isManager = team && team.teamManager.username === localStorage.getItem("username");
    const teamId = Number(localStorage.getItem("teamId"));
    const navigate = useNavigate();

    const getAllTasks = async () => {
        let response;
        if (isManager) {
            response = await ipcRenderer.invoke("get", "/tasks/createdBy", localStorage.getItem("token"));
        } else {
            response = await ipcRenderer.invoke("get", "/tasks/executedBy", localStorage.getItem("token"));
        }
        if (response.code === 200) {
            setTasks(response.result);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    const getTeam = async () => {
        const response = await ipcRenderer.invoke("get", `/teams/${teamId}`, localStorage.getItem("token"));
        if (response.code === 200) {
            setTeam(response.result);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    useEffect(() => {
        getAllTasks();
        getTeam();
    }, [isManager])

    const onChange = async (taskId: number, itemId: number) => {
        const task = tasks.filter(ele => ele.id === taskId)[0];
        const item = task.items.filter(ele => ele.id === itemId)[0];
        item.isFinish = !item.isFinish;
        let response = await ipcRenderer.invoke("patch", `/items/${itemId}`, { isFinish: item.isFinish }, localStorage.getItem("token"));
        if (response.code === 200) {
            setTasks([...tasks]);
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
        let taskFinish = true;
        task.items.forEach(item => {
            if (item.isFinish === false) {
                taskFinish = false;
            }
        })
        response = await ipcRenderer.invoke("patch", `/tasks/${taskId}`, { isFinish: taskFinish }, localStorage.getItem("token"));
        if (response.code === 200) {
            task.isFinish = taskFinish;
            setTasks([...tasks]);
        }
    }

    const handleDelete = async (type: "task" | "item", id: number, task?: ITask) => {
        let response;
        if (type === "task") {
            response = await ipcRenderer.invoke("delete", `/tasks/${id}`, localStorage.getItem("token"));
        } else if (type === "item") {
            response = await ipcRenderer.invoke("delete", `/items/${id}`, localStorage.getItem("token"));
        }
        if (response && response.code === 200) {
            if (type === "task") {
                setTasks(tasks.filter(task => task.id !== id));
            } else {
                tasks.forEach(each => {
                    if (each.id === task.id) {
                        each.items = each.items.filter(item => item.id !== id);
                    }
                })
                setTasks([...tasks]);
            }
        } else if (response && response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    const renderItem = (task: ITask) => (
        task.items?.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Checkbox onChange={() => onChange(task.id, item.id)} checked={item.isFinish} disabled={isManager ? true : false}>
                    {item.text}
                </Checkbox>
                {isManager && (
                    <div style={{ display: "flex", gap: "4px" }}>
                        <ItemModal type="edit" tasks={tasks} setTasks={setTasks} taskId={task.id} item={item} />
                        <Popconfirm
                            title="你确定要移除这个条目吗?"
                            onConfirm={() => handleDelete("item", item.id, task)}
                            okText="确定"
                            cancelText="取消"
                        >
                            <DeleteTwoTone />
                        </Popconfirm>

                    </div>
                )}
            </div>
        ))
    )

    const renderList = (task: ITask) => (
        <List.Item>
            <Card title={
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                    <span>{task.target}</span>
                    <Tag color={task.isFinish ? "green" : "red"}>{task.isFinish ? "已完成" : "未完成"}</Tag>
                </div>
            }
                bordered
                actions={isManager ? [
                    <TaskModal type="edit" tasks={tasks} setTasks={setTasks} team={team} task={task} />,
                    <ItemModal type="create" tasks={tasks} setTasks={setTasks} taskId={task.id} />,
                    <Popconfirm
                        title="你确定要移除这个计划吗?"
                        onConfirm={() => handleDelete("task", task.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <DeleteOutlined key="delete" />
                    </Popconfirm>
                ] : null}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {
                        renderItem(task)
                    }
                </div>
                <Divider />
                <RangePicker
                    value={[moment(task.startAt.substring(0, 10), 'YYYY-MM-DD'), moment(task.deadline.substring(0, 10), 'YYYY-MM-DD')]}
                    disabled
                />

            </Card>
        </List.Item>
    )

    return (
        <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={
                status === 0 ? tasks : status === 1 ?
                    tasks.filter(task => task.isFinish === true) :
                    tasks.filter(task => task.isFinish === false)
            }
            header={
                <div style={{ display: "flex", gap: "8px", flexDirection: "row-reverse" }}>
                    <Button type="default" onClick={() => setStatus(0)}>展示全部</Button>
                    <Button type="primary" onClick={() => setStatus(1)}>已完成</Button>
                    <Button type="primary" danger onClick={() => setStatus(2)}>未完成</Button>
                    {
                        isManager &&
                        <div style={{ marginRight: "auto" }}>
                            <TaskModal type="create" tasks={tasks} setTasks={setTasks} team={team} />
                        </div>
                    }
                </div>
            }
            renderItem={renderList}
        />
    )
}

export default Task;